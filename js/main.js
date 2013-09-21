var pop;
var annotations = new Object();
var prevWord;
var speakers = {};

$(document).ready(function() {
	pop = Popcorn.youtube("#youtube", "http://www.youtube.com/v/bu-Au2ga9Y0");
	$('.clear').on('click', function() {
		$('.transcript').text('');
	});

});

function getLocation() {
	console.log('start!');
	$.ajax({
		url: 'downsampled.xml',
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
	$.ajax({
		url: 'David_references.xml',
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

			var offset = 38.4;
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