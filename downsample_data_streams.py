# downsample_data_streams.py

# downsample a synchronized data streams file.
# take 1 out of every N sync points.

from xml.dom import minidom
import argparse

def downsample_data_streams(in_file_name,
                            out_file_name,
                            N=150):
    print 'parsing...'
    in_doc = minidom.parse(open(in_file_name, 'r'))
    print 'done parsing'
    top_element = in_doc.childNodes[0]
    
    out_doc = minidom.getDOMImplementation().createDocument(None, "SYNCHRONIZED_DATA_STREAMS", None)
    out_top_element = out_doc.documentElement
    
    print 'choosing keepers'
    keepers = [n for n in top_element.childNodes if n.localName == 'sync_point'][0::N]
    print 'writing keepers to new top elem...'
    for k in keepers:
        out_top_element.appendChild(k)

    print 'writing outfile'
    #write file
    out_doc.writexml(open(out_file_name,'w'), addindent='    ', newl='\n')

    return None

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='''
    downsample a synchronized data stream file taking 
    one out of every N sync points
    ''')
    
    parser.add_argument('input',
                        metavar='<input file name>',
                        help=': input synchronized data stream file')
    parser.add_argument('output',
                        metavar='<downsampled output file name>',
                        help=': downsampled output synchronzed data stream file')
    parser.add_argument('-N',
                        type=int,
                        default=150,
                        help=': downsampling ratio. default=150')
    
    args  = vars(parser.parse_args())
    N = args['N']
    in_file_name = args['input']
    out_file_name = args['output']

    downsample_data_streams(in_file_name,
                            out_file_name,
                            N)
