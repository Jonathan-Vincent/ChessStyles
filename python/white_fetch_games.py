#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import berserk
import pickle
import time


client = berserk.Client()

toplist = ['DrNykterstein','penguingim1','Zhigalko_Sergei','opperwezen',
           'Night-King96','Ogrilla','Alexander_Zubov','nihalsarin2004']



gamelist = []
y = []
requestedgames = 30  #3000 in full version

for j,player in enumerate(toplist):
    #sleep to prevent lichess blocking request
    time.sleep(2)
    games = client.games.export_by_player(player,color='white',perf_type='bullet',max=requestedgames)

    i=0

    for game in games:
        try:
            user = game['players']['black']['user']['name']
        except:
            continue
        
        var = game['variant']
        if var != 'standard':
            print(i,var)
            continue
        
        pgn = game['moves']
        gamelength = len(pgn.split(' '))
        #Eliminate games that are too short
        if gamelength < 20:
            print(i,player,user,gamelength,pgn)
            continue
        
        if i % 10 == 0:
            print(i,player,user,pgn[:6])
        i += 1
        gamelist.append(pgn)
        y.append(j)
        
pickle.dump( gamelist, open( "data/white_games.p", "wb" ) )
pickle.dump( y, open( "data/white_labels.p", "wb" ) )
pickle.dump( toplist, open( "data/player_list.p", "wb" ) )