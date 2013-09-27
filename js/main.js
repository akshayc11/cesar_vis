var pop;
var annotations = new Object();
var prevWord;
var speakers = {};
var runID = 'CESAR_Jun-Sun-3-09-09-17-2012';
var runDir = './data' + '/' + runID;
var annotationFile = '/object-reference.xml'
var videoLinks = {
    'CESAR_Jun-Sun-3-09-09-17-2012'  : 'http://youtu.be/QyhkQM8YeFs',
    'CESAR_Jun-Sun-3-11-10-36-2012'  : 'http://youtu.be/6y2TabtMBZg',
    'CESAR_Jun-Sun-3-13-01-47-2012'  : 'http://youtu.be/d3rCD_abWtw',
    'CESAR_Jun-Thu-21-09-08-54-2012' : 'http://youtu.be/aocxzwabZ7s',
    'CESAR_Jun-Thu-21-11-04-52-2012' : 'http://youtu.be/-0BzaqHY5cA',
    'CESAR_Jun-Thu-21-13-30-23-2012' : 'http://youtu.be/gGV8p5yIQ-U',
    'CESAR_Jun-Thu-21-17-12-36-2012' : 'http://youtu.be/kbg4w2V_dDU',
    'CESAR_May-Fri-25-14-55-42-2012' : 'http://youtu.be/3onoC90zH8I',
    'CESAR_May-Fri-25-17-05-43-2012' : 'http://youtu.be/e8PaI6EHLaU',
    'CESAR_May-Fri-25-19-15-14-2012' : 'http://youtu.be/-zhVUI6-UjM',
    'CESAR_May-Thu-17-11-36-14-2012' : 'http://youtu.be/tuSJIwRTyrQ',
    'CESAR_May-Thu-31-09-17-54-2012' : 'http://youtu.be/xx3p-Rxaovg',
    'CESAR_May-Thu-31-11-21-35-2012' : 'http://youtu.be/P38pPv8uUaI',
    'CESAR_May-Thu-31-15-06-55-2012' : 'http://youtu.be/apgP3exK_CM',
    'CESAR_May-Tue-29-13-06-47-2012' : 'http://youtu.be/a1ydibr9Q0w'
};

var offsets = {
    'CESAR_Jun-Sun-3-09-09-17-2012'  : 49.37,
    'CESAR_Jun-Sun-3-11-10-36-2012'  : 182.63,
    'CESAR_Jun-Sun-3-13-01-47-2012'  : 131.4,
    'CESAR_Jun-Thu-21-09-08-54-2012' : 33.27,
    'CESAR_Jun-Thu-21-11-04-52-2012' : 57.13,
    'CESAR_Jun-Thu-21-13-30-23-2012' : 28.46,
    'CESAR_Jun-Thu-21-17-12-36-2012' : 45.2,
    'CESAR_May-Fri-25-14-55-42-2012' : 88.6,
    'CESAR_May-Fri-25-17-05-43-2012' : 84.87,
    'CESAR_May-Fri-25-19-15-14-2012' : 25.27,
    'CESAR_May-Thu-17-11-36-14-2012' : 80.97,
    'CESAR_May-Thu-31-09-17-54-2012' : 64.23,
    'CESAR_May-Thu-31-11-21-35-2012' : 122.17,
    'CESAR_May-Thu-31-15-06-55-2012' : 38.4,
    'CESAR_May-Tue-29-13-06-47-2012' : 149.77
};


function videoReset() {

    $(document).ready(function() {
	pop = Popcorn.youtube("#youtube", videoLinks[runID]);
	$('.clear').on('click', function() {
	    $('.transcript').text('');
	});
	
    });
}

videoReset();

function reInitialize() {
    pop.destroy();
    delete annotations;
    annotations = new Object();
    videoReset();
    maps();
}

function runSelect(runValue) {
    // debugger;
    runID = runValue;
    runDir = './data/' + runValue;
    reInitialize();
}

function annotationSelect(annotationValue) {
    // debugger;
    annotationFile=annotationValue;
    reInitialize();
}

function getLocation() {
    console.log('start!');
    $.ajax({
    url: runDir.concat('/downsampled_data_streams.xml'),
	type: 'GET',
	dataType: 'xml',
	complete: function(xhr, textStatus) {},
	success: function(data, textStatus, xhr) {
	    var $xml = $(data);
	    var sync_point = $xml.find('sync_point');
	    for (var i = 0; i < sync_point.length; i++) {
		var timestamp = parseFloat($(sync_point[i]).attr('timestamp'));
		var sample = $(sync_point[i]).children('sample')[0];
		var data = $(sample).attr('data');
		data = data.split(',')

		var lat = parseFloat(data[2]) / 100;
		if (data[3] == "S")
		    lat *= -1;
		lat = -25.9082155 + 1.7 * lat;

		var lng = parseFloat(data[4]) / 100;
		if (data[5] == "W")
		    lng *= -1;
		lng = 85.401194 + 1.7 * lng;

		console.log(lat);
		console.log(lng);
		timestamp /= 1000;
		gpsListener(timestamp, lat, lng);

	    };
	},
	error: function(xhr, textStatus, errorThrown) {}
    });

}

function getAnnotations() {
    // debugger;
    $.ajax({
    url: runDir.concat(annotationFile),
	type: 'GET',
	dataType: 'xml',
	complete: function(xhr, textStatus) {
	    //called when complete
	},
	success: function(data, textStatus, xhr) {
	    var $xml = $(data);
	    var word = $xml.find('word');
	    var annotation = $xml.find('annotation');
	    var previous = 0;
	    var utterancePeriod = .5;
	    var sentence;
	    var utterances = [];
	    var prevText;
	    var startTime;
	    var endTime;
	    var prevSpeaker;


	    for (var i = 0; i < annotation.length; i++) {
		var label = $(annotation[i]).attr('label');
		var name = $(annotation[i]).attr('name');
		var number = $(annotation[i]).attr('number');
		var object_parameter = $(annotation[i]).attr('object_parameter');
		var text_parameters = $(annotation[i]).attr('text_parameters');

		var words = $(annotation[i]).attr('words');
		words = words.replace('[', '')
		words = words.replace("']", '')
		words = words.replace("u'", '');
		words = words.replace("', u'", ',')
		words = words.split(',')

		for (var j = 0; j < words.length; j++) {
		    annotations[words[j]] = object_parameter;
		};
	    };
	    var offset = offsets[runID]
	    for (var i = 0; i < word.length; i++) {
		var text = $(word[i]).attr('text');
		var s_time = $(word[i]).attr('s_time');
		var e_time = $(word[i]).attr('e_time');
		s_time = parseFloat(s_time) + offset;
		e_time = parseFloat(e_time) + offset;
		var name = $(word[i]).attr('name');
		var speaker = $(word[i]).attr('speaker');

		if (i != 0) {
		    if (s_time - previous < .5 && speaker == prevSpeaker) {
			sentence += " " + text;
		    } else {
			endTime = previous;
			var object = {
			    start: startTime,
			    end: endTime,
			    content: sentence
			}
			utterances.push(object);
			transcriptListener(startTime, endTime, sentence, prevSpeaker);
			sentence = speaker + " : " + text;
			startTime = s_time;
		    }
		} else {
		    sentence = speaker + " : " + text;
		    startTime = s_time;
		}
		previous = e_time;
		prevSpeaker = speaker;
		videoListener(s_time, e_time, name, text);
	    };
	    pop.on("timeupdate", function() {
		$('.currentTime').text(Math.floor(this.currentTime() * 100) / 100);
	    });
	    pop.on("canplay", function() {
		console.log("hello");
	    });

	    utterances.push(sentence);
	    transcriptListener(startTime, previous, sentence);
	    console.log('utter', utterances);
	},
	error: function(xhr, textStatus, errorThrown) {
	    //called when there is an error
	}
    });


}

function gpsListener(time, lat, lng) {
    console.log('run');
    var marker;
    pop.code({
	start: time,
	end: time + 5,
	onStart: function(options) {
	    marker = createMarker(lat, lng);
	    map.panTo(new google.maps.LatLng(lat, lng));
	},
	onEnd: function(options) {
	    marker.setMap(null);
	}
    });
}

function transcriptListener(start, end, content, speaker) {
    pop.code({
	start: start,
	end: end,
	onStart: function(options) {
	    $('.transcript').append("<a class='" + speaker + "'>" + content + "</a>");
	    $('.transcript').scrollTop(9999);
	},
	onEnd: function(options) {
	    // $('.transcript').append();
	}
    });
}

function videoListener(s_time, e_time, name, text) {
    pop.code({
	start: s_time,
	end: e_time,
	onStart: function(options) {
	    if (annotations[name]) {
		var key = annotations[name];
		if (polygonList[key]) {
		    polygonList[key].setOptions({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35
		    });
		} else {
		    console.log(key + ' is not in database');
		}

	    }
	},
	onEnd: function(options) {
	    if (annotations[name]) {
		var key = annotations[name];
		if (polygonList[key]) {
		    polygonList[key].setOptions({
			strokeColor: '#FFCB00',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FFCB00',
			fillOpacity: 0.35
		    });
		} else {
		    console.log(key + ' is not in database');
		}
	    }
	}
    });
}
