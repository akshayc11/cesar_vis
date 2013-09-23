#!/usr/bin/python

'''
This is a script to copy over the object references, synchronized data stream
for the runs specified by a list file into the data folder here
'''


import argparse
import sys
import os
import shutil


from downsample_data_streams import downsample_data_streams as downsample
if __name__ == '__main__':
    
    parser = argparse.ArgumentParser(description='''
    This script is used to aggregate the references data 
    from given location for given runs from a list file 
    And then store the data in a specified location
    ''')
    
    parser.add_argument('data',
                        metavar='<data directory>',
                        help=': input data directory with annotations and metadata')
    
    parser.add_argument('list',
                        metavar='<run list>',
                        help=': list of runs to be used')
    
    parser.add_argument('--output',
                        default='./data',
                        help=': directory where output is to be stored')
    
    
    parser.add_argument('-N',
                        type=int,
                        default=150,
                        help=': downsampling ratio for the synchronized data stream default=150')
    
    args = vars(parser.parse_args())
    
    dataDir   = args['data']
    inListId  = args['list']
    N         = args['N']
    outputDir = args['output']
    if not os.path.exists(outputDir):
        os.makedirs(outputDir)
    
    inListP = open(inListId,'r')
    for line in inListP:
        runId    = line.strip()
        print runId
        run      = dataDir   + '/' + runId
        outRun   = outputDir + '/' + runId
        if not os.path.exists(outRun):
            os.makedirs(outRun)
        objFile  = run       + '/object-reference.xml'
        outObj   = outRun    + '/object-reference.xml'
        syncFile = run       + '/synchronized_data_streams.xml'
        outSync  = outRun    + '/downsampled_data_streams.xml'
        
        
        downsample(syncFile, outSync, N)
        shutil.copyfile(objFile, outObj)
        
