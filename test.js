var minorscale = [0,2,3,5,7,8,10,12];
var majorscale = [0,2,4,5,7,9,11,12];

var scale = "major";
var key = 40;

var audiourl;

$(document).ready(function(){

	var clickX = new Array();
	var clickY = new Array();
	var clickDrag = new Array();
	var paint;

	function addClick(x, y, dragging)
	{
	  clickX.push(x);
	  clickY.push(y);
	  clickDrag.push(dragging);
	}

	function redraw(){
	  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
	  
	  context.strokeStyle = "#000000";
	  //context.strokeStyle = '#'+Math.floor(Math.random()*16777215).toString(16);
	  context.lineJoin = "round";
	  context.lineWidth = 10;
				
	  for(var i=0; i < clickX.length; i++) {		
	    context.beginPath();
	    if(clickDrag[i] && i){
	      context.moveTo(clickX[i-1], clickY[i-1]);
	     }else{
	       context.moveTo(clickX[i]-1, clickY[i]);
	     }
	     context.lineTo(clickX[i], clickY[i]);
	     context.closePath();
	     context.stroke();
	  }
	}

	function createDownloadLink() {
	    rec && rec.exportWAV(function(blob) {
	      audiourl = URL.createObjectURL(blob);
	    });
	  }

	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audiocontext = new AudioContext();

	var oscillator = audiocontext.createOscillator();

	oscillator.type = 1;
	oscillator.frequency.value = 440;

	var gainNode =audiocontext.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audiocontext.destination);
	gainNode.gain.value = 0.001 / 4;

	//var rec = new Recorder(oscillator);
	//rec.record();
	var clicking = false;

	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext('2d');
	      
    var dataURL = canvas.toDataURL();

    document.getElementById('myCanvas').src = dataURL;

	canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(canvas, evt);
		var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
		gainNode.gain.value = mousePos.y / 800;
		oscillator.connect(gainNode);
		if (scale == "major"){
			oscillator.frequency.value = Math.pow(2,(majorscale[Math.floor(mousePos.x/100)]-49+key)/12)*440;
		}
		else if (scale == "minor"){
			oscillator.frequency.value = Math.pow(2,(minorscale[Math.floor(mousePos.x/100)]-49+key)/12)*440;
		}
		if (clicking){
			//writeMessage(canvas, message);
		}

		////
		  if(paint){
		    addClick(evt.pageX - this.offsetLeft, evt.pageY - this.offsetTop, true);
		    redraw();
		  }
	}, false);

	$('#key-select').change(function(){
		key = parseInt($('#key-select').val(),10);
	});

	$('#scale-select').change(function(){
		scale = $('#scale-select').val();
	})

	$('#myCanvas').mousedown(function(e){
		clicking = true;
		//oscillator.setWaveTable(createWave());
		oscillator.connect(audiocontext.destination);
		oscillator.start(0);
		//oscillator.noteOn(0);
		//gainNode.gain.linearRampToValueAtTime(0.0,audiocontext.currentTime+500);
		//gainNode.gain.linearRampToValueAtTime(1,audiocontext.currentTime);
		//gainNode.gain.linearRampToValueAtTime(0,audiocontext.currentTime+50);
		//oscillator.playbackRate.value = 102.0;
		///////
		  var mouseX = e.pageX - this.offsetLeft;
		  var mouseY = e.pageY - this.offsetTop;
				
		  paint = true;
		  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		  redraw();
	});
	$('#myCanvas').mouseup(function(){
		clicking = false;
		paint = false;
		gainNode.gain.setValueAtTime(0, audiocontext.currentTime);
		
		//gainNode.gain.linearRampToValueAtTime(0.0,audiocontext.currentTime);
		setTimeout(function(){oscillator.disconnect();},50);
		//console.log("hey");
		//gainNode.gain.setValueAtTime(1, audiocontext.currentTime);
		
		
	});

	$('#myCanvas').mouseleave(function(){
		clicking = false;
		paint = false;
		oscillator.disconnect();
	});

	$('#clear-btn').click(function(){
		context.clearRect(0,0,myCanvas.width,myCanvas.height);
		clickX = new Array();
		clickY = new Array();
		clickDrag = new Array();
		//rec.clear();
	});

	$('#save-img-btn').click(function(){
		Canvas2Image.saveAsPNG(document.getElementById('myCanvas'));
	});

	// $('#save-audio').click(function(){
	// 	rec.stop();
	// 	rec.exportWAV(doneEncoding);
	// 	rec.clear();
	// });

	function doneEncoding(blob){
		Recorder.forceDownload(blob, "myaudio.wav");
	}

});
