#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from keras.models import Sequential, load_model
from keras.layers import LSTM, Dense, Dropout
from keras.preprocessing import text
import pickle
import numpy as np
import random
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.decomposition import PCA
from scipy.sparse import csr_matrix
from matplotlib.patches import Ellipse
import matplotlib.pyplot as plt
import matplotlib.transforms as transforms
import numpy as np
import matplotlib.cm as cm
import csv

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
openinglength = 14
num_players = len(toplist)

whitegames = []
samplesize = len(gamelist)

for game in gamelist:
    #white = ' '.join(i for i in game.split(' ')[:openinglength*2:2])
    white = ' '.join('white' + i.replace('x','') if j%2==0 else 'black' + i.replace('x','') for j,i in enumerate(game.split(' ')[:openinglength]))
  
    whitegames.append(white)

tokeniser = text.Tokenizer(filters='!"#$%&()*+,./:;<>?@[\\]^_`{|}~\t\n')
tokeniser.fit_on_texts(whitegames)
sequences= tokeniser.texts_to_sequences(whitegames)

idx_word = tokeniser.index_word

num_moves = len(idx_word)

onehotseqs = np.zeros((samplesize,openinglength,num_moves+1), dtype=np.int8)

for i, seq in enumerate(sequences):
    for j,k in enumerate(seq):
        onehotseqs[i,j,k] = 1
        
labels = y

for i,player in enumerate(toplist):
    print(player,labels.count(i))

movefreq = onehotseqs.sum(axis=1)
print(movefreq.shape)


pca = PCA(n_components=2)
pca.fit(movefreq)

idx_word[0] = ''

axsum = [round(elem, 2) for elem in sorted(np.add(np.abs(pca.components_[0]),np.abs(pca.components_[1])))]
axsumargs = np.argsort(np.add(np.abs(pca.components_[0]),np.abs(pca.components_[1])))
axone = pca.components_[0][axsumargs]
axtwo = pca.components_[1][axsumargs]
axsummvs = [idx_word[x] for _,x in sorted(zip(np.add(np.abs(pca.components_[0]),np.abs(pca.components_[1])),range(len(pca.components_[1]))))]
maxval=max(axsum)

Xpca = pca.transform(movefreq)
print(Xpca.shape)

colors = cm.get_cmap('tab20')
fig, ax = plt.subplots(figsize=(13,13))

A = [k[0] for k in Xpca]
B = [k[1] for k in Xpca]

meanA= []
meanB=[]
right = 1.6
top = 1.9
for i in range(1,20):
    print(i,axsummvs[-i],axsum[-i],axone[-i],axtwo[-i])
    print(2,0, axone[-i], axtwo[-i])
    ax.arrow(right,top-0.2*i, axone[-i]/5, axtwo[-i]/5, head_width=0.02, head_length=0.02, fc='k', ec='k',label=axsummvs[-i])
    ax.annotate(axsummvs[-i],(right+0.15,top-0.2*i))
    
for i,player in enumerate(toplist):
    playerA = []
    playerB = []
    for j,label in enumerate(labels):
        if label == i:
            playerA.append(A[j])
            playerB.append(B[j])
            
    meanA.append(np.median(playerA))
    meanB.append(np.median(playerB))
    
    ax.scatter(playerA, playerB, s = 1,color = colors(i/num_players))
    
    confidence_ellipse(np.asarray(playerA), np.asarray(playerB), ax, n_std=0.5, edgecolor=colors(i/num_players),linewidth=2)

for i,player in enumerate(toplist):
    ax.scatter(meanA[i], meanB[i], s = 200,marker='o',edgecolors = 'k',label=player,color = colors(i/num_players),linewidth=2)


ax.legend(loc='lower left')

'''
with open('data/white_xy.csv', mode='w') as xy_file:
    csv_writer = csv.writer(xy_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    csv_writer.writerow(['X', 'Y', 'Player', 'PGN'])
    for i,game in enumerate(Xpca):
        X = game[0]
        Y = game[1]
        player = toplist[labels[i]]
        PGN = gamelist[i]
        csv_writer.writerow([X,Y,player,PGN])
'''


