window.onresize = cheResize;

function cheResize() {
	$("#screenwide")[0].innerText = window.innerWidth;
	if((window.innerWidth < 1150)) {
		$("#content")[0].style.zoom = (window.innerWidth/1150) - 0.01;
	} else {
		$("#content")[0].style.zoom = 1;
	}
	if((window.innerWidth < 1000)) {
		$("#sorry").fadeIn();
	} else {
		$("#sorry").fadeOut();
	}
}
cheResize();

var isPlaying = !1;
var curBeat = 0;
var curTempo = 120;
var initTitle = document.title;

function playNextBeat() {
	if (isPlaying !== false) {
		var nextBeat = 60000 / curTempo / 4;
		$("#tracker li.pip").removeClass("active");
		$("#tracker li.pip.col_" + curBeat).addClass("active");
		var tmpAudio;
		$(".soundrow[id^=control] li.pip.active.col_" + curBeat).each(function(i){
			tmpAudio = document.getElementById($(this).data('sound_id'));
			if (!tmpAudio.paused) {
				tmpAudio.pause();
				tmpAudio.currentTime = 0.0;
			}
			tmpAudio.play();
		});
		curBeat = (curBeat + 1) % 16;
	}
}

function generateURLHash() {
	var newhash = '';
	$(".soundrow[id^=control] li.pip").each(function(i){
		newhash += $(this).is('.active') ? ',' : '.';
	});
	newhash += '|';
	newhash += $('#temposlider').slider('value');
	if (location.hash != '#' + newhash) location.hash = newhash;
}

function loadHash() {
	if (location.hash.length > 0) {
		var pieces = location.hash.substring(1).split('|');
		var lights = pieces[0];
		$(".soundrow[id^=control] li.pip").each(function(i){
			if (i >= lights.length) return false;
			if (lights.charAt(i) == ',') {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});
		if (typeof pieces[1] !== 'undefined') {
			$('#temposlider').slider('value', parseInt(pieces[1]));
			$('#tempovalue').innerHTML = pieces[1];
			curTempo = parseInt(pieces[1]);
		}
		if (isPlaying !== false) {
			clearInterval(isPlaying);
			isPlaying = setInterval(playNextBeat, 60000 / curTempo / 4);
		}
	}
}

function clearAll() {
	$(".soundrow[id^=control] li.active").removeClass('active');
	generateURLHash();
}
function shareit() {
	console.log(new Date().getTime());
	this.innerText = "loading...";
	this.disabled = true;

	prompt("Copy this URL and share with your friends!", "http://akshatmittal.github.io/beatdrummer/"+location.hash);

	this.innerText = "Share!";
	this.disabled = false;
}
function saveslot(a) {
	localStorage['save'+a] = location.hash;
	checkslots();
}
function loadslot(a) {
	if(localStorage['save' + a] == undefined) {
		alert("This slot is empty!");
	} else {
		location.hash = localStorage['save' + a];
		loadHash();	
	}
}
function checkslots() {
	for(i = 1; i<4;i++) {
		if (localStorage['save' + i] != undefined) {
			$("#slot"+i+".slotstatu")[0].innerText = i + ". Saved";
			$("#loadslot" + i)[0].disabled = false;
		} else {
			$("#slot"+i+".slotstatu")[0].innerText = i + ". empty";
			$("#loadslot" + i)[0].disabled = true;
		}
	}
}
function clearslotsi() {
	localStorage.clear();
	checkslots();
}
function loaddemo(a) {
	var sou = new Array("#,,..,,..,,..,,....................,................................,...,...,.......................................................,...,...,....,.............,,..........,...................,.,..............................,|80","#.,.,...,...,...,.......,.......,.................................................................................,....,.,..,.,.....,...,.,.....,...................,...,...,....................................................|120", "#................,....,,.....,,,...,,....,,.........................................................,...,...,...,.................................................,...,...,...,,.................................................|120");
	location.hash = sou[a-1];
	loadHash();
}
$(document).ready(function(){
	$("audio").each(function(i){
		var self = this;
		// this, coz typing them all is real stress.
		var $ul = $('<ul id="control_' + this.id + '" class="soundrow">');
		$ul.append('<li class="header">' + this.title + '</li>');
		for (j = 0; j < 16; j++) {
			var $li = $('<li class="pip col_'+j+'">'+self.id+'</li>').click(function(){
							$(this).toggleClass('active');
							generateURLHash();
						}).data('sound_id', self.id);
			$ul.append($li);
		}
		$('<li>').append($ul).appendTo('#lights');
	});
	$("#soundstart").click(function(){
		if (isPlaying === false) {
			curBeat = 0;
			isPlaying = setInterval(playNextBeat, 60000 / curTempo / 4);
			this.innerHTML = "Stop!";
			document.title = "♫ " + initTitle;
		} else {
			clearInterval(isPlaying);
			isPlaying = false;
			$("#tracker li.pip").removeClass("active");
			$("audio").each(function(){
				this.pause();
				this.currentTime = 0.0;
			});
			this.innerHTML = "Start!";
			document.title = initTitle;
		}
	});

	$('#clearall').click(clearAll);
	$('#reload').click(loadHash);
	$('#share').click(shareit);
	$('#crearslots').click(clearslotsi);
 
	if (location.hash != '') {
		loadHash();
	}
	$('#tempovalue').html(curTempo);
	$('#temposlider').slider({
		'value': curTempo,
		'min': 30,
		'max': 180,
		'step': 5,
		'slide': function(e, ui) {
			curTempo = ui.value;
			$('#tempovalue').html(curTempo);
			if (isPlaying !== false) {
				clearInterval(isPlaying);
				isPlaying = setInterval(playNextBeat, 60000 / curTempo / 4);
			}
		},
		'stop': function(e, ui) {
			generateURLHash();
		}
	});
	checkslots();
});