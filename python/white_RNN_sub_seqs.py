#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout
from keras.preprocessing import text
import pickle
import numpy as np
import random
import tensorflowjs as tfjs

#Creates recurrent neural network trained on games, that classifies the player
#of the game. To improve model, and increase the size of the dataset, every
#subsequence of each game is added to the training data

#The RNN generally gets around 75% accuracy. Guessing by chance, one would expect 
#12.5% accuracy, so the RNN is a significant improvement.

gamelist = pickle.load( open( "data/white_games.p", "rb" ))
y = pickle.load( open( "data/white_labels.p", "rb" ))
toplist = pickle.load( open( "data/player_list.p", "rb" ))

#Parameters
openinglength = 20
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
    #white = ' '.join(i for j,i in enumerate(game.split(' ')[1:1+2*openinglength:2]))
    
    #Only white's moves, captures not considered
    #white = ' '.join(i.replace('x','') for j,i in enumerate(game.split(' ')[:2*openinglength:2]))
    whitegames.append(white)


movelimit = 5000
tokeniser = text.Tokenizer(num_words=movelimit,filters='!"#$%&+()*,./:;<>?@[\\]^_`{|}~\t\n')
tokeniser.fit_on_texts(whitegames)
sequences= tokeniser.texts_to_sequences(whitegames)

idx_word = tokeniser.index_word

num_moves = min(movelimit,len(idx_word)+1)
print(movelimit,len(idx_word)+1)

n=0
numsubseqs = int(openinglength)
#Ratio of games to be set aside for validation
ratio = 0.1
lastindex = int(samplesize*ratio)
onehotseqs = np.zeros(((samplesize-lastindex)*(numsubseqs)+lastindex,openinglength,num_moves), dtype=np.int8)
labels = np.zeros(((samplesize-lastindex)*(numsubseqs)+lastindex,num_players), dtype=np.int8)

print(onehotseqs.shape)
print(labels.shape)
print(numsubseqs)
print(lastindex)

#convert all game subsequences to onehot format
for seqlength in range(2,openinglength+1):
    for i, seq in enumerate(sequences[:-lastindex]):
        for j,k in enumerate(seq):
            onehotseqs[(samplesize-lastindex)*n+i,j,k] = 1
    n+=1
        
n = 0
for seqlength in range(2,openinglength+1):
    for i, player in enumerate(y[:-lastindex]):
        labels[n*(samplesize-lastindex)+i,player] = 1
    n+=1
    
#Store validation data
for i, seq in enumerate(sequences[-lastindex:]):
    for j,k in enumerate(seq):
        onehotseqs[(samplesize-lastindex)*numsubseqs+i,j,k] = 1
        
for i, player in enumerate(y[-lastindex:]):
    labels[numsubseqs*(samplesize-lastindex)+i,player] = 1

model = Sequential()

# Recurrent layer
model.add(LSTM(100, input_dim = num_moves, input_length = openinglength))

# Fully connected layer
model.add(Dense(100, activation='sigmoid'))

# Dropout for regularization
model.add(Dropout(0.5))

# Output layer
model.add(Dense(num_players, activation='softmax'))

# Compile the model
model.compile(
    optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

print(model.summary())


model.fit(onehotseqs,labels, epochs=3,validation_split = ratio/(numsubseqs+ratio))

#uncomment to save js version of model
#tfjs.converters.save_keras_model(model, 'data/whiteRNNmodel20sigmoidsoftmax2')


    