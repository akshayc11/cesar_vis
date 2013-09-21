# downsample_data_streams.py

# downsample a synchronized data streams file.
# take 1 out of every N sync points.

from xml.dom import minidom

N = 150
in_file_name = "/home/cohend/CESAR_May-Thu-31-15-06-55-2012/synchronized_data_streams.xml"
out_file_name = "/home/cohend/downsampled.xml"


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
