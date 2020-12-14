#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout
from keras.preprocessing import text
import pickle
import numpy as np
import random
import tensorflowjs as tfjs

gamelist = pickle.load( open( "data/white_games.p", "rb" ))
y = pickle.load( open( "data/white_labels.p", "rb" ))
toplist = pickle.load( open( "data/player_list.p", "rb" ))

#Parameters
openinglength = 8
num_players = len(toplist)

#Shuffle Data
c = list(zip(gamelist, y))
random.shuffle(c)
gamelist, y = zip(*c)

print(len(gamelist),len(y))


whitegames = []
samplesize = len(gamelist)

for game in gamelist:
    #Both sides moves, captures not considered
    white = ' '.join('w' + i.replace('x','') if j%2==0 else 'b' + i.replace('x','') for j,i in enumerate(game.split(' ')[:openinglength]))
    
    #Both sides moves, captures are considered
    #white = ' '.join('w' + i if j%2==0 else i for j,i in enumerate(game.split(' ')[:openinglength]))    
    
    #Only white's moves, captures are considered
    #white = ' '.join(i for j,i in enumerate(game.split(' ')[:2*openinglength:2]))
    
    #Only white's moves, captures not considered
    #white = ' '.join(i.replace('x','') for j,i in enumerate(game.split(' ')[:2*openinglength:2]))
    whitegames.append(white)


movelimit = 5000
tokeniser = text.Tokenizer(num_words=movelimit,filters='!"#$%&+()*,./:;<>?@[\\]^_`{|}~\t\n')
tokeniser.fit_on_texts(whitegames)
sequences= tokeniser.texts_to_sequences(whitegames)

idx_word = tokeniser.index_word

num_moves = min(movelimit,len(idx_word)+1)

onehotseqs = np.zeros((samplesize,openinglength,num_moves), dtype=np.int8)
labels = np.zeros((samplesize,num_players), dtype=np.int8)

for i, seq in enumerate(sequences):
    for j,k in enumerate(seq):
        
        onehotseqs[i,j,k] = 1
        
for i, player in enumerate(y):
    labels[i,player] = 1
        
print(onehotseqs.shape)
print(labels.shape)


model = Sequential()

# Recurrent layer
model.add(LSTM(100, input_dim = num_moves, input_length = openinglength))

# Fully connected layer
model.add(Dense(100, activation='relu'))

# Dropout for regularization
model.add(Dropout(0.5))

# Output layer
model.add(Dense(num_players, activation='softmax'))

# Compile the model
model.compile(
    optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

print(model.summary())

model.fit(onehotseqs,labels, epochs=20,validation_split = 0.1)

tfjs.converters.save_keras_model(model, 'data/whiteRNNmodel20')