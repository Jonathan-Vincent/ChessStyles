#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from keras.preprocessing import text
import pickle
import numpy as np
import matplotlib.pyplot as plt


gamelist = pickle.load( open( "data/white_games.p", "rb" ))
y = pickle.load( open( "data/white_labels.p", "rb" ))
toplist = pickle.load( open( "data/player_list.p", "rb" ))

#Parameters
num_players = len(toplist)
samplesize = len(gamelist)
x =[]

for openinglength in range(60):

    whitegames = []

    for game in gamelist:    
        white = ' '.join('w' + i.replace('x','') if j%2==0 else 'b' + i.replace('x','') for j,i in enumerate(game.split(' ')[:openinglength]))
        
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
    movefreq = onehotseqs.sum(axis=1)
    print(movefreq.shape)
    var = np.var(movefreq)
    x.append(var)
    print(openinglength,var)

plt.plot(x)