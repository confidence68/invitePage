/*
 Based on the krpano iOS 4.2 gyroscope script
 by Aldo Hoeben / fieldofview.com
 contributions by Sjeiti / ronvalstar.nl

 Port for Pano2VR
 Thomas Rauscher / ggnome.com

 This software can be used free of charge and the source code is available under a Creative Commons Attribution license:
 http://creativecommons.org/licenses/by/3.0/

 */


function pano2vrGyro(panoObject,containerId) {

	this.setAdaptiveVOffset=function(arg) {
		if((arg===undefined) || (arg === null) || (arg == "")) {
			isAdaptiveDiffTilt = !isAdaptiveDiffTilt;
		} else {
			isAdaptiveDiffTilt = Boolean(arg);
		}
	}

	this.setTrueNorth=function(arg) {
		if(arg==undefined || arg === null || arg == "")
			isTrueNorth = !isTrueNorth;
		else
			isTrueNorth = Boolean(arg);
	}

	this.setUseRoll=function(arg) {
		if(arg==undefined || arg === null || arg == "")
			useRoll = !useRoll;
		else
			useRoll = Boolean(arg);
	}

	this.setUseMoveTo=function(arg,speed) {
		if(arg==undefined || arg === null || arg == "")
			useMoveTo = !useMoveTo;
		else {
			useMoveTo = Boolean(arg);
			if (speed>0.0) {
				moveToSpeed=speed;
			}
		}
	}

	////////////////////////////////////////////////////////////

	function handleTouchStart(event) {
		isTouching = true;
	}

	function handleTouchEnd(event) {
		isTouching = false;
	}

	function handleDeviceOrientation(event) {

		if ((!event["alpha"]) || (!event["beta"]) || (!event["gamma"])) return;

		var d = new Date();
		var isTouching=(panoSrcObj.isTouching());
		if (isTouching) {
			lastTouch = d.getTime();
		}
		if ( !isTouching && isEnabled && (d.getTime()-lastTouch)>1000) {

			// process event.alpha, event.beta and event.gamma
			var orientation = rotateEuler( new Object( {
						yaw: event["alpha"] * degRad,
						pitch: event["beta"] * degRad,
						roll: event["gamma"] * degRad
					} ) ),
					yaw = orientation.yaw / degRad,
					pitch = orientation.pitch / degRad,
					roll = orientation.roll / degRad,
					altyaw = yaw,
					factor;

			switch(window.orientation) {
				case 0:
					roll += 180;
					break;
				case 90:
					roll += 90;
					break;
				case -90:
					roll += -90;
					break;
				case 180:
					roll += 0;
					break;
				default:
					roll += 180.0;
			}

			// fix gimbal lock
			if( Math.abs(pitch) > 70 ) {
				altyaw = event.alpha;

				switch(window.orientation) {
					case 0:
						if ( pitch>0 ) {
							altyaw += 180;
						}
						break;
					case 90:
						altyaw += 90;
						break;
					case -90:
						altyaw += -90;
						break;
					case 180:
						if ( pitch<0 ) {
							altyaw += 180;
						}
						break;
				}

				altyaw = altyaw % 360;
				if( Math.abs( altyaw - yaw ) > 180 )
					altyaw += ( altyaw < yaw ) ? 360 : -360;

				factor = Math.min( 1, ( Math.abs( pitch ) - 70 ) / 10 );
				yaw = yaw * ( 1-factor ) + altyaw * factor;
			}
			if (isTrueNorth) {
				var panoHeading = panoSrcObj.getPanNorth() - panoSrcObj.getPanN();
				var deviceHeading=null;

				if ((event.webkitCompassHeading) && ((!event.webkitCompassAccuracy) || (event.webkitCompassAccuracy>=0))) { // iOS
					deviceHeading = event.webkitCompassHeading;
					if (window.orientation) {
						deviceHeading+=window.orientation;
					}
				} else {
					if (event.absolute === true && event.alpha !== null) { // Android
						deviceHeading = 90.0-yaw;
					}
				}
				if (deviceHeading!==null) {
					diffPan= - (deviceHeading + panoHeading + yaw);
				}
			}


			if (ignoreInit==0) {
				var newPan=(diffPan + yaw);
				while ((newPan - panoSrcObj.getPan())>180) newPan-=360.0;
				while ((newPan - panoSrcObj.getPan())<-180.0) newPan+=360.0;
				for(var i=0;i<panoDstObj.length;i++) {
					if (useMoveTo) {
						if (useRoll) {
							panoDstObj[i].moveTo(newPan, -pitch, panoSrcObj.getFov(), moveToSpeed, roll);
						} else {
							panoDstObj[i].moveTo(newPan, -pitch, panoSrcObj.getFov(), moveToSpeed);
						}
					} else {
						var f=0.5; // filter
						panoDstObj[i].setPan(f*(newPan-panoSrcObj.getPan()) +  panoSrcObj.getPan());
						panoDstObj[i].setTilt(f*(-pitch-panoSrcObj.getTilt()) + panoSrcObj.getTilt());
						if (useRoll) {
							panoDstObj[i].setRoll(f*(roll-panoSrcObj.getRoll()) + panoSrcObj.getRoll());
						}
					}
				}
			}
			lastYaw = yaw;
			lastPitch = -pitch;
			if (ignoreInit>0) {
				diffPan = panoSrcObj.getPan() - lastYaw;
				diffTilt = panoSrcObj.getTilt() - lastPitch;
				ignoreInit--;
			}
			adaptDiffTilt();
		} else {
			diffPan = panoSrcObj.getPan() - lastYaw;
			diffTilt = panoSrcObj.getTilt() - lastPitch;
		}
	}

	function adaptDiffTilt() {
		if( diffTilt != 0 && isAdaptiveDiffTilt ) {
			diffTilt *= 0.98;
			if( Math.abs( diffTilt ) < 0.1 ) {
				diffTilt = 0;
			}
		}
	}

	function rotateEuler( euler ) {
		// based on http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToMatrix/index.htm
		// and http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToEuler/index.htm

		var heading, bank, attitude,
				ch = Math.cos(euler.yaw),
				sh = Math.sin(euler.yaw),
				ca = Math.cos(euler.pitch),
				sa = Math.sin(euler.pitch),
				cb = Math.cos(euler.roll),
				sb = Math.sin(euler.roll);

		// note: includes 90 degree rotation around z axis
		matrix = new Array(
				sh*sb - ch*sa*cb,   -ch*ca,    ch*sa*sb + sh*cb,
				ca*cb,              -sa,      -ca*sb,
				sh*sa*cb + ch*sb,    sh*ca,   -sh*sa*sb + ch*cb
		);

		/* [m00 m01 m02] 0 1 2
		 * [m10 m11 m12] 3 4 5 
		 * [m20 m21 m22] 6 7 8 */

		if (matrix[3] > 0.9999) { // singularity at north pole
			heading = Math.atan2(matrix[2],matrix[8]);
			attitude = Math.PI/2;
			bank = 0;
		} else if (matrix[3] < -0.9999) { // singularity at south pole
			heading = Math.atan2(matrix[2],matrix[8]);
			attitude = -Math.PI/2;
			bank = 0;
		} else {
			heading = Math.atan2(-matrix[6],matrix[0]);
			bank = Math.atan2(-matrix[5],matrix[4]);
			attitude = Math.asin(matrix[3]);
		}

		return new Object( { yaw:heading, pitch:attitude, roll:bank } )
	}

	this.enable=function() {
		if (isDeviceEnabled && !isEnabled) {
			window.addEventListener("deviceorientation", handleDeviceOrientation, true);
			container.addEventListener("touchstart", handleTouchStart, true);
			container.addEventListener("touchend", handleTouchEnd, true);
			container.addEventListener("touchcancel", handleTouchEnd, true);
			container.addEventListener("MSPointerDown", handleTouchStart, true);
			container.addEventListener("mousedown", handleTouchStart, true);
			container.addEventListener("mousemove", handleTouchStart, true);
			container.addEventListener("mouseup", handleTouchEnd, true);
			isEnabled = true;
		}
		return isEnabled;
	}

	this.disable=function() {
		if (isDeviceEnabled && isEnabled) {
			window.removeEventListener("deviceorientation", handleDeviceOrientation);
			container.removeEventListener("touchstart", handleTouchStart);
			container.removeEventListener("touchend", handleTouchEnd);
			container.removeEventListener("touchcancel", handleTouchEnd);
			isEnabled = false;
		}
		return isEnabled;
	}

	this.toggle=function() {
		if(isEnabled)
			return this.disable();
		else
			return this.enable();
	}

	///////////////////////////////////////////////////
	var lastYaw=0;
	var lastPitch=0;
	var lastTouch=0;
	var ignoreInit=10;
	var isDeviceEnabled = !!window.DeviceOrientationEvent,
			isEnabled = false,
			isAdaptiveDiffTilt = false,
			isTrueNorth = false,
			isEasing = 0.5,
			useRoll = false,
			useMoveTo = true,
			moveToSpeed = 10,
			isTouching = false,
			diffPan = 0, diffTilt = 0,
			hlookat = 0, vlookat = 0;

	var	degRad = Math.PI/180;
	var panoSrcObj;
	var panoDstObj=[];

	if (panoObject instanceof Array) {
		panoSrcObj=panoObject[0];
		panoDstObj=panoObject;
	} else {
		panoSrcObj=panoObject;
		panoDstObj[0]=panoObject;
	}
	// turn on "auto level"
	var container = document.getElementById(containerId);

	diffPan = panoSrcObj.getPan();
	diffTilt = panoSrcObj.getTilt();

	this.enable();

	////////////////////////////////////////////////////////////
}

