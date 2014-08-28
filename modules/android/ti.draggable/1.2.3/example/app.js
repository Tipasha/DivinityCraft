/*
 *   Copyright 2012 Pedro Enrique
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *   
 */

var Draggable = require('ti.draggable');

var win = Ti.UI.createWindow({
	backgroundColor:'#ccc',
	fullscreen: false,
	exitOnClose: true
});

var size = {
	height: Ti.Platform.displayCaps.platformHeight - 40,
	width: Ti.Platform.displayCaps.platformWidth
};

function Label(text,touchy){
	return Ti.UI.createLabel({
		height:30,left:10,right:10,
		backgroundColor:'white',
		textAlign:'center',
		text: text,
		touchEnabled:false
	});
}

var horizontal = Draggable.createView({
	left:0,
	top:0,
	width:100,
	height:100,
	backgroundColor:'red',
	minLeft: 0,
	maxLeft: size.width-100,
	axis:'x'
});

horizontal.add(Label('horizontal'));

var vertical = Draggable.createView({
	left:0,
	top:0,
	width:100,
	height:100,
	backgroundColor:'green',
	minTop: 0,
	maxTop: size.height-100,
	axis:'y'
});
vertical.add(Label('vertical'));

var free = Draggable.createView({
	top:0,
	left:0,
	width:100,
	height:100,
	backgroundColor:'blue'
});

free.add(Label('free'));

win.add(vertical);
win.add(free);
win.add(horizontal);

horizontal.addEventListener('click', function(e){
	alert(e);
});

free.addEventListener('start', function(e){
	Ti.API.info('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
	Ti.API.info('Event "start"');
	Ti.API.info('left: '+e.left);
	Ti.API.info('top:  '+e.top);
	Ti.API.info('center:'+JSON.stringify(e.center));
});

free.addEventListener('move', function(e){
	Ti.API.info('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
	Ti.API.info('Event "move"');
	Ti.API.info('left: '+e.left);
	Ti.API.info('top:  '+e.top);
	Ti.API.info('center:'+JSON.stringify(e.center));
});

free.addEventListener('end', function(e){
	Ti.API.info('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
	Ti.API.info('Event "end"');
	Ti.API.info('left: '+e.left);
	Ti.API.info('top:  '+e.top);
	Ti.API.info('directionVertical: '+ e.directionVertical);
	Ti.API.info('directionHorizontal: '+ e.directionHorizontal);
	Ti.API.info('center:'+JSON.stringify(e.center));
});


win.open();
