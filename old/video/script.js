
window.onload = function(){
  var video = document.getElementById("video");
  if (Hls.isSupported()) {
    console.log("HLS.js is Supported");
    //CL Codec = High Level 5.2 AVC MP4 VIDEO, AAC-LC AUDIO
    var audioCodec = "mp4a.40.2";
    var videoCodec = "avc1.640034";
    var audioTest = 'audio/mp4; codecs="' + audioCodec + '"';
    var videoTest = 'video/mp4; codecs="' + videoCodec + '"';
    var audioConfirmation = MediaSource.isTypeSupported(audioTest);
    var videoConfirmation = MediaSource.isTypeSupported(videoTest);

    if(!audioConfirmation) {
      console.error("Expected Audio Codec Not Supported: " + audioTest);
    }
    if(!videoConfirmation) {
      console.error("Expected Video Codec Not Supported: " + videoTest);
    }

    if(audioConfirmation && videoConfirmation)
    {
      console.log("Audio & Video Codecs should be Supported");
      var hls = new Hls();
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function() {
        console.log("Video & HLS.js are bound");
        hls.loadSource("011/master-mole.m3u8");

      })
      hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
        console.log("Manifest parsed, found " + data.levels.length + " quality levels");
        //var playPromise = video.play();
        //	if(playPromise !== undefined)
        //	{
        //		playPromise.then(_ => {
        //			console.log("Playback successful");
        //		})
        //		.catch(error => {
        //			console.error("Error starting playback: " + error);
        //		})
        //	}
      })
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.log("fatal network error encountered, try to recover");
            hls.startLoad();
            break;
            case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("Fatal media error encountered: " + data.details);
            counter += 1;
            if(counter < 4)
            {
              console.log("Attempting Recovery...");
              hls.recoverMediaError();
            }
            else {
              console.log("Too Many recovery Attempts, Destroying Stream.");
              hls.destroy();
            }
            break;
            default:
            // cannot recover
            hls.destroy();
            break;
          }
        }
      });
    }
    else {
      video.style.display = "none";
      var videoError = document.getElementById("videoError");
      videoError.style.display = "block";
    }
  }
  else {
    console.error("HLS Streaming is NOT Supported");
    video.style.display = "none";
    var backup = document.getElementById("backup");
    backup.style.display = "block";
  }
};
var counter = 1;
function seekToTime() {
  var time = document.forms["controls"]["Time"];
  if(isNaN(time.value) || time.value < 0) {
    console.error("Time found invalid: " + time.value);
    time.invalid = true;
  }
  else {
    var video = document.getElementById("video");
    video.currentTime = time.value;
    var playPromise = video.play();
    	if(playPromise !== undefined)
    	{
    		playPromise.then(_ => {
    			console.log("Playback successful");
    		})
    		.catch(error => {
    			console.error("Error starting playback: " + error);
    		})
    	}
  }
}
