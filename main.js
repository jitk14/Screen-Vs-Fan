/*****************************************************************************
* Script to create the Static Fan Effect
*****************************************************************************/

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

fanGlobals = {
    fpsZone: {
        fps : "calculating",
        lastFPSTime: 0,
        framesDrawnFromLastCycle: 0 
    },
    rps : 0
}

var calculateFPS = function(){
    var currentSecond = new Date().getUTCSeconds();
        lastSecond = fanGlobals.fpsZone.lastFPSTime;
    
    fanGlobals.fpsZone.framesDrawnFromLastCycle++;

    if(currentSecond - lastSecond === 1){
        fanGlobals.fpsZone.fps = fanGlobals.fpsZone.framesDrawnFromLastCycle;
        fanGlobals.fpsZone.framesDrawnFromLastCycle = 0;
    }else if(currentSecond - lastSecond > 1){
        fanGlobals.fpsZone.fps = "Calculating";
    }

    fanGlobals.fpsZone.lastFPSTime = currentSecond;

}

function drawFan(canvas,wings,position,rotationAngle){
    var ctx = canvas.getContext('2d'),
        wingCount = wings.length,
        wing,
        i;

    for(i = 0; i < wingCount; i++){
        wing = wings[i];
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        ctx.arc(position.x, position.y, wing.radius, wing.startAngle + rotationAngle, wing.endAngle + rotationAngle, false);
        ctx.fillStyle = wing.fillStyle;
        ctx.fill();
        ctx.closePath();
    }
}

function renderInfo(canvas,position, infos){
    var ctx = canvas.getContext('2d'),
        i,
        textMatrix,
        fontHeightDelta = 0,
        info;

    ctx.beginPath();

    for(i = 0; i < infos.length; i++){
        info = infos[i];
        ctx.fillStyle = info.fillStyle || "#999";
        ctx.font="16px verdana";
        ctx.fillText(info,position.x, position.y + fontHeightDelta);
        fontHeightDelta = fontHeightDelta + 30;
        
    }
}

var generateWings = function(count){
    var wings = [],
        i,
        count = parseInt(count) > 0 ? parseInt(count) : 3,
        angularDistance = (2 * Math.PI)/count;
    
    for(i = 0; i < count; i++){
        wing = {
            fillStyle: 'rgb(' + Math.floor(256*Math.random()) + ',' + Math.floor(256*Math.random()) + ',' + Math.floor(256*Math.random()) + ')',
            startAngle: angularDistance * i,
            endAngle: angularDistance * i + (Math.PI/6),
            radius: 150,
        }

        wings.push(wing);
    }

    return wings;

};


var renderer = (function(){
    var rotationAngleFan = 0,
        canvas = document.getElementById('canvas-zone'),
        ctx = canvas.getContext('2d'),
        canvasHeight= canvas.height,
        canvasWidth = canvas.width,
        velocity = 0.01;
        wings = generateWings(3);
		pause = false;

    var render = function(){
		if(!pause){
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			rotationAngleFan = rotationAngleFan + velocity;
			drawFan(canvas, wings, {x:300, y:200}, rotationAngleFan);
            renderInfo(canvas,{x:500,y:100},getFanInfo());
		}
    };

    var getVelocity = function(){
        return velocity;
    };

    var setVelocity = function(angVelocity){
        velocity = angVelocity;
    };

    var getScreenFPS = function(){

    }
	
	var togglePause = function(){
		pause = !pause;
	}

    var getFanInfo = function(){
        var textInfos = [],
            angularSpeed,
            rps,
            currentSecond = new Date().getMilliseconds(),
            lastSecond = fanGlobals.fpsZone.lastFPSTime;
        
        if(fanGlobals.fpsZone.fps >= 0){
            angularSpeed = (180 * velocity / Math.PI) * fanGlobals.fpsZone.fps;
        }
    
        fanGlobals.rps = angularSpeed/360;

        textInfos.push("Angular Speed: " + angularSpeed);
        textInfos.push("RPS: " + fanGlobals.rps);
        textInfos.push("FPS: " + fanGlobals.fpsZone.fps);

        return textInfos;
    }

    return {
        render: render,
        getVelocity: getVelocity,
        setVelocity: setVelocity,
		togglePause: togglePause
    }
})();

window.addEventListener('keydown',function(ev){
    var delta;

    if(fanGlobals.rps % 60 < 3 || fanGlobals.rps % 60 > 57)
    {
        delta = 0.001;
    } 
    else {
        delta = 0.01;
    }

	switch(ev.which){
		case 40: renderer.setVelocity(renderer.getVelocity() - delta);
                 ev.preventDefault();
				 break;
		case 38: renderer.setVelocity(renderer.getVelocity() + delta);
                 ev.preventDefault();
			     break;
		case 80: renderer.togglePause();
			     break;
		default: ;
	}
});

(function animloop(){
  requestAnimFrame(animloop);
  calculateFPS();
  renderer.render();
})();

