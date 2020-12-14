#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from keras.preprocessing import text
import pickle
import numpy as np
from sklearn.decomposition import PCA
from matplotlib.patches import Ellipse
import matplotlib.pyplot as plt
import matplotlib.transforms as transforms
import numpy as np
import matplotlib.cm as cm
import csv

#Generate chart of games, using principal component analysis on the vector of
#move frequencies, computed after specified move number.
#This results in a somewhat cluttered graph, with games moving towards the centre

def confidence_ellipse(x, y, ax, n_std=3.0, facecolor='none', **kwargs):
    if x.size != y.size:
        raise ValueError("x and y must be the same size")

    cov = np.cov(x, y)
    pearson = cov[0, 1]/np.sqrt(cov[0, 0] * cov[1, 1])
    # Using a special case to obtain the eigenvalues of this
    # two-dimensionl dataset.
    ell_radius_x = np.sqrt(1 + pearson)
    ell_radius_y = np.sqrt(1 - pearson)
    ellipse = Ellipse((0, 0), width=ell_radius_x * 2, height=ell_radius_y * 2,
                      facecolor=facecolor, **kwargs)

    # Calculating the stdandard deviation of x from
    # the squareroot of the variance and multiplying
    # with the given number of standard deviations.
    scale_x = np.sqrt(cov[0, 0]) * n_std
    mean_x = np.mean(x)

    # calculating the stdandard deviation of y ...
    scale_y = np.sqrt(cov[1, 1]) * n_std
    mean_y = np.mean(y)

    transf = transforms.Affine2D() \
        .rotate_deg(45) \
        .scale(scale_x, scale_y) \
        .translate(mean_x, mean_y)

    ellipse.set_transform(transf + ax.transData)
    return ax.add_patch(ellipse)

gamelist = pickle.load( open( "data/white_games.p", "rb" ))
y = pickle.load( open( "data/white_labels.p", "rb" ))
toplist = pickle.load( open( "data/player_list.p", "rb" ))

#Parameters
num_players = len(toplist)
samplesize = len(gamelist)

sumA = [0.0]*samplesize
sumB = [0.0]*samplesize
n=0
colors = cm.get_cmap('tab20')

means = []
comps = []


whitegames = []

for game in gamelist:
    #white = ' '.join(i for i in game.split(' ')[:openinglength*2:2])
    white = ' '.join('white' + i.replace('x','') if j%2==0 else 'black' + i.replace('x','') for j,i in enumerate(game.split(' ')[:40]))
  
    whitegames.append(white)
        
tokeniser = text.Tokenizer(filters='!"#$%&()*+,./:;<>?@[\\]^_`{|}~\t\n')
tokeniser.fit_on_texts(whitegames)

labels = y

idx_word = tokeniser.index_word
idx_word[0] = ''

for openinglength in range(8,42,2):
    n+=1
    whitegames = []
    
    for game in gamelist:
    #white = ' '.join(i for i in game.split(' ')[:openinglength*2:2])
        white = ' '.join('white' + i.replace('x','') if j%2==0 else 'black' + i.replace('x','') for j,i in enumerate(game.split(' ')[:openinglength]))
  
        whitegames.append(white)

    sequences= tokeniser.texts_to_sequences(whitegames)
    e4_idx = tokeniser.word_index['whitee4']

    num_moves = len(idx_word)

    onehotseqs = np.zeros((samplesize,40,num_moves), dtype=np.double)

    for i, seq in enumerate(sequences):
        for j,k in enumerate(seq):
            onehotseqs[i,j,k] = 1
        
   

    movefreq = onehotseqs.sum(axis=1)
    print(openinglength,movefreq.shape)


    pca = PCA(n_components=2,svd_solver='full')
    pca.fit(movefreq)
    
    
    #force e4 to point up and left
    if pca.components_[0][e4_idx] > 0:
        pca.components_[0] = -pca.components_[0]
    if pca.components_[1][e4_idx] < 0:
        pca.components_[1] = -pca.components_[1]
        
    comps.append(pca.components_)
    means.append(pca.mean_)
    print(openinglength,pca.components_.shape)

    axsum = [round(elem, 2) for elem in sorted(np.add(np.abs(pca.components_[0]),np.abs(pca.components_[1])))]
    axsumargs = np.argsort(np.add(np.abs(pca.components_[0]),np.abs(pca.components_[1])))
    axone = pca.components_[0][axsumargs]
    axtwo = pca.components_[1][axsumargs]
    axsummvs = [idx_word[x] for _,x in sorted(zip(np.add(np.abs(pca.components_[0]),np.abs(pca.components_[1])),range(len(pca.components_[1]))))]
    maxval=max(axsum)

    Xpca = pca.transform(movefreq)
    
    
    fig, ax = plt.subplots(figsize=(13,13))
    
    
    A = [k[0] for k in Xpca]
    B = [k[1] for k in Xpca]
    
    sumA = [sumA[i] + j/n for i,j in enumerate(A)]
    normSumA = sumA/max(sumA)
    sumB = [sumB[i]  + j/n for i,j in enumerate(B)]
    normSumB = sumB/max(sumB)
    
    print(sumA[0],sumB[0])

    meanA= []
    meanB=[]
    right = 0.9*max(sumA)
    top =  max(sumB)
    
    ax.annotate("moves="+str(openinglength),(right,top))
    for i in range(1,20):
        ax.arrow(right,top-(top/10)*i, axone[-i]/5, axtwo[-i]/5, head_width=0.02, head_length=0.02, fc='k', ec='k',label=axsummvs[-i])
        ax.annotate(axsummvs[-i],(right+0.15,top-(top/10)*i))


    for i,player in enumerate(toplist):
        playerA = []
        playerB = []
        for j,label in enumerate(labels):
            if label == i:
                playerA.append(sumA[j])
                playerB.append(sumB[j])
            
        meanA.append(np.median(playerA))
        meanB.append(np.median(playerB))
    
        ax.scatter(playerA, playerB, s = 1,color = colors(i/num_players))
    
        confidence_ellipse(np.asarray(playerA), np.asarray(playerB), ax, n_std=0.5, edgecolor=colors(i/num_players),linewidth=2)

    for i,player in enumerate(toplist):
        ax.scatter(meanA[i], meanB[i], s = 200,marker='o',edgecolors = 'k',label=player,color = colors(i/num_players),linewidth=2)


    ax.legend(loc='lower left')
    
    #fig.savefig("./data/sum" + str(openinglength) + ".png")

      
#pickle.dump( tokeniser, open( "data/tokeniser.p", "wb" ) )
#pickle.dump( comps, open( "data/comps.p", "wb" ) )
#pickle.dump( means, open( "data/means.p", "wb" ) )

"""
with open('data/unnormed_sum40_xy.csv', mode='w') as xy_file:
    csv_writer = csv.writer(xy_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    csv_writer.writerow(['X', 'Y', 'Player', 'PGN'])
    for i,x in enumerate(sumA):
        X = x
        Y = sumB[i]
        player = toplist[labels[i]]
        PGN = gamelist[i]
        csv_writer.writerow([X,Y,player,PGN])"""