'use strict';
document.addEventListener('DOMContentLoaded', function(){

	let view = 0;	//0 --> horizontal, 1 --> vertical(from top)
	let mass = [30, 30, 30, 30];
	let stiff = [30, 30, 30, 30];
	let com = [0, 0];	//center of mass
	let cor = [0, 0];	//center of stiffness/resistance
	let forceDirn = 0;	//0 --> left to right, 1 --> right to left, 2 --> back to front, 3 --> front to back

	const topLim = 595;
	const sideLim = 100;

	const forceMenu = document.getElementById('forceMenu');
	const viewButton = document.getElementById('viewButton');
	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

	forceMenu.addEventListener('change', function() { window.clearTimeout(tmHandle); forceDirn = Number(forceMenu.value); restart(); });
	viewButton.addEventListener('click', function() { window.clearTimeout(tmHandle); view = !view; restart(); });
	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});

	function init()
	{
		bldgTop = [
			[startL[0] - 50, defY + thickness],
			[startR[0], defY + 150 + thickness],
			[startL[3], defY + 150 + thickness],
			[startR[3] + 50, defY + thickness],
		];

		bldgTopLayer2 = [
			[bldgTop[0][0], defY],
			[bldgTop[0][0], defY + thickness],
			[bldgTop[3][0], defY + thickness],
			[bldgTop[3][0], defY],
		];
		bldgSide = [];

		legs = [
			[[startL[0], defY], [startL[0], defY - height]],
			[[startL[1], defY], [startL[1], defY - 2 * height / 3]],
			[[startR[2], defY], [startR[2], defY - 2 * height / 3]],
			[[startR[3], defY], [startR[3], defY - height]],
		];

		if(view)
		{
			bldgTop[0][1] = defY - height;
			bldgTop[1][0] = bldgTop[0][0];
			bldgTop[2][0] = bldgTop[3][0];
			bldgTop[3][1] = defY - height;

			bldgTopLayer2 = [];
			legs = [];
		}

		calc(mass, com, bldgTop);
		calc(stiff, cor, bldgTop);
		mid = [(bldgTop[0][0] + bldgTop[3][0]) / 2, (bldgTop[0][1] + bldgTop[1][1]) / 2];
		dirn = 0;

		if(com[0] != mid[0] && forceDirn > 1)
		{
			dirn = 1;
			if((com[0] < mid[0] && forceDirn === 2) || (com[0] > mid[0] && forceDirn === 3))
			{
				dirn = -1;
			}
		}

		else if(com[1] != mid[1] && forceDirn <= 1)
		{
			dirn = 1;
			if((com[1] < mid[1] && forceDirn === 0) || (com[1] > mid[1] && forceDirn === 1))
			{
				dirn = -1;
			}
		}

		if(cor[0] != mid[0] && forceDirn > 1)
		{
			dirn = -1;
			if((cor[0] < mid[0] && forceDirn === 2) || (cor[0] > mid[0] && forceDirn === 3))
			{
				dirn = 1;
			}
		}

		else if(cor[1] != mid[1] && forceDirn <= 1)
		{
			dirn = -1;
			if((cor[1] < mid[1] && forceDirn === 0) || (cor[1] > mid[1] && forceDirn === 1))
			{
				dirn = 1;
			}
		}

	}

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 
		init();
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const sliders = ["mass1", "mass2", "mass3", "mass4", "stiff1", "stiff2", "stiff3", "stiff4"];
	sliders.forEach(function(elem, ind){
		const slider = document.getElementById(elem);
		const output = document.getElementById("demo_" + elem);
		output.innerHTML = slider.value; // Display the default slider value

		slider.oninput = function() {
			output.innerHTML = this.value;
			if(ind < 4)
			{
				mass[ind] = Number(document.getElementById(elem).value);
			}
			else
			{
				stiff[ind - 4] = Number(document.getElementById(elem).value);
			}

			restart();
		};
	});

	function canvas_arrow(context, fromX, fromY, toX, toY) {
		const headlen = 10; // length of head in pixels
		const dx = toX - fromX;
		const dy = toY - fromY;
		const angle = math.atan2(dy, dx);

		context.moveTo(fromX, fromY);
		context.lineTo(toX, toY);
		context.lineTo(toX - headlen * math.cos(angle - math.PI / 6), toY - headlen * math.sin(angle - math.PI / 6));
		context.moveTo(toX, toY);
		context.lineTo(toX - headlen * math.cos(angle + math.PI / 6), toY - headlen * math.sin(angle + math.PI / 6));
	}

	function topRotation(obj, bldgTop, bldgTopLayer2, mid)
	{
		if(!obj.dirn)
		{
			return;
		}

		let angle = 1 * math.PI / 180;

		if(obj.dirn > 0)
		{
			angle *= -1;
		}

		const rot = [[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]];

		const tcom = math.subtract(obj.com, mid);
		const tcor = math.subtract(obj.cor, mid);

		bldgTop.forEach(function(vertex, ind){
			bldgTop[ind] = math.add(math.multiply(rot, math.subtract(vertex, mid)), mid);
		});

		if(bldgTop[2][0] > bldgTop[3][0])
		{
			obj.bldgSide = [
				{...bldgTopLayer2[3]},
				{...bldgTopLayer2[2]},
				{...bldgTop[2]},
				[bldgTop[2][0], bldgTop[2][1] - thickness],
			];
		}

		obj.com = math.add(math.multiply(rot, tcom), mid);
		obj.cor = math.add(math.multiply(rot, tcor), mid);

		if(bldgTop[0][1] >= topLim || bldgTop[1][1] >= topLim || bldgTop[2][1] >= topLim || bldgTop[3][1] >= topLim)
		{
			obj.dirn = 0;
		}
	}

	function sideRotation(obj, bldgTop, bldgTopLayer2, legs, mid)
	{
		if(!obj.dirn)
		{
			return;
		}

		const change = 1.5;
		let rot = [
			[2 * change, -3 * change],
			[-4 * change, -2 * change],
			[-1 * change, -0.25 * change],
			[2.5 * change, -1 * change],
		];

		if(obj.dirn === 1)
		{
			rot.reverse();
			rot.forEach(r => {
				r[0] *= -1;
			});

			legs[0] = [[legs[0][0][0] - 1.5 * change, legs[0][0][1] - 1 * change], [legs[0][1][0] - 1.5 * change, legs[0][1][1] - 1 * change]];
			legs[1] = [[legs[1][0][0] + 2 * change, legs[1][0][1] - 0.25 * change], [legs[1][1][0] + 2 * change, legs[1][1][1] - 1.25 * change]];
			legs[2] = [[legs[2][0][0] + 3 * change, legs[2][0][1] + 1 * change], [legs[2][1][0] + 3 * change, legs[2][1][1] - 2 * change]];
			legs[3] = [[legs[3][0][0] - 2 * change, legs[3][0][1] - 2 * change], [legs[3][1][0] - 2 * change, legs[3][1][1] - 2 * change]];
		}
		
		else
		{
			legs[0] = [[legs[0][0][0] + 2 * change, legs[0][0][1] - 2 * change], [legs[0][1][0] + 2 * change, legs[0][1][1] - 2 * change]];
			legs[1] = [[legs[1][0][0] - 3 * change, legs[1][0][1] + 1 * change], [legs[1][1][0] - 3 * change, legs[1][1][1] - 2 * change]];
			legs[2] = [[legs[2][0][0] - 2 * change, legs[2][0][1] - 0.25 * change], [legs[2][1][0] - 2 * change, legs[2][1][1] - 1.25 * change]];
			legs[3] = [[legs[3][0][0] + 1.5 * change, legs[3][0][1] - 1 * change], [legs[3][1][0] + 1.5 * change, legs[3][1][1] - 1 * change]];
		}

		bldgTop.forEach(function(v, i){
			bldgTop[i] = [v[0] + rot[i][0], v[1] + rot[i][1]];
			bldgTopLayer2[i] = [bldgTopLayer2[i][0] + rot[3 * (i > 1)][0], bldgTopLayer2[i][1] + rot[3 * (i > 1)][1]];
		});

		if(obj.dirn === 1 && bldgTop[2][0] > bldgTop[3][0])
		{
			obj.bldgSide = [
				{...bldgTopLayer2[3]},
				{...bldgTopLayer2[2]},
				{...bldgTop[2]},
				[bldgTop[2][0], bldgTop[2][1] - thickness],
			];
		}

		else if(obj.dirn === -1 && bldgTop[1][0] < bldgTop[0][0])
		{
			obj.bldgSide = [
				{...bldgTopLayer2[0]},
				{...bldgTopLayer2[1]},
				{...bldgTop[1]},
				[bldgTop[1][0], bldgTop[1][1] - thickness],
			];
		}

		if(bldgTop[0][0] <= (startL[0] - 50 - sideLim) || bldgTop[3][0] >= (startR[3] + 50 + sideLim))
		{
			obj.dirn = 0;
		}

		mid[0] = (bldgTop[0][0] + bldgTop[3][0]) / 2;
		mid[1] = (bldgTop[0][1] + bldgTop[1][1]) / 2;
	}

	function calc(ent, center, bldgTop)
	{
		let tot = 0;
		center[0] = 0;
		center[1] = 0;

		ent.forEach(function(value, i) {
			tot += value;
			let temp = [value * (3 * bldgTop[0][0] + bldgTop[3][0]) / 4, value * (bldgTop[0][1] + 3 * bldgTop[1][1]) / 4];

			if(i > 1)
			{
				temp[0] = value * (bldgTop[0][0] + 3 * bldgTop[3][0]) / 4;
			}

			if(i === 0 || i === 3)
			{
				temp[1] = value * (3 * bldgTop[0][1] + bldgTop[1][1]) / 4;
			}

			center[0] += temp[0];
			center[1] += temp[1];
		});
		
		center[0] /= tot;
		center[1] /= tot;
	}

	function drawShape(ctx, v)
	{
		if(!v.length)
		{
			return;
		}

		ctx.beginPath();
		ctx.moveTo(v[0][0], 600 - v[0][1]);

		v.forEach(function(vertex, ind){
			const next = (ind + 1) % v.length;
			const ratio = 0.5;
			const ctrl = [(v[ind][0] + v[next][0]) * ratio, (v[ind][1] + v[next][1]) * ratio];
			ctx.quadraticCurveTo(ctrl[0], 600 - ctrl[1], v[next][0], 600 - v[next][1]);
		});

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	const canvas = document.getElementById("main");
	canvas.width = 1200;
	canvas.height = 600;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9";
	const border = "black";
	const lineWidth = 1.5;
	const fps = 15;

	const defY = 400;
	const breadth = 50;
	const height = 300;
	const startL = [250, 250 + breadth, 900, 900 + breadth];
	const startR = [startL[0] + breadth, startL[1] + breadth, startL[2] + breadth, startL[3] + breadth];
	const thickness = 20;

	let bldgTop = [], bldgTopLayer2 = [], bldgSide = [], legs = [], mid, dirn;
	init();

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = fill;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		const len = 50;
		const leftPad = 50;
		const topPad = 30;
		ctx.beginPath();
		if(forceDirn === 0 || forceDirn === 2)
		{
			canvas_arrow(ctx, leftPad, topPad, leftPad + len * (!forceDirn), topPad + len * forceDirn / 2);
		}
		
		else
		{
			canvas_arrow(ctx, leftPad + len * (forceDirn == 1), topPad + len * (forceDirn == 3), leftPad, topPad);
		}
		ctx.stroke();

		legs.forEach(function(leg, k){
			ctx.save();
			ctx.lineWidth = 5;
			drawShape(ctx, leg);
			ctx.restore();
		});

		ctx.save();
		ctx.fillStyle = "pink";
		drawShape(ctx, bldgTop);
		drawShape(ctx, bldgTopLayer2);
		drawShape(ctx, bldgSide);
		ctx.restore();

		const vertical = [
			math.multiply(math.add(bldgTop[1], bldgTop[2]), 0.5),
			math.multiply(math.add(bldgTop[0], bldgTop[3]), 0.5),
		];
		const horizontal = [
			math.multiply(math.add(bldgTop[0], bldgTop[1]), 0.5),
			math.multiply(math.add(bldgTop[2], bldgTop[3]), 0.5),
		];

		drawShape(ctx, vertical);
		drawShape(ctx, horizontal);
		ctx.font = "30px Arial";
		ctx.fillStyle = "black";
		bldgTop.forEach(function(vertex, ind){
			ctx.fillText(ind + 1, (vertex[0] + mid[0]) / 2, 600 - (vertex[1] + mid[1]) / 2);
		});

		if(view)
		{
			ctx.save();
			ctx.fillStyle = "red";
			ctx.fillRect(com[0] - 3, 600 - com[1] - 3, 6, 6);
			ctx.fillStyle = fill;

			ctx.fillStyle = "blue";
			ctx.fillRect(cor[0] - 3, 600 - cor[1] - 3, 6, 6);
			ctx.fillStyle = fill;
			ctx.restore();
		}

		let obj = {
			dirn: dirn,
			com: com,
			cor: cor,
			bldgSide: bldgSide,
		};

		if(view)
		{
			topRotation(obj, bldgTop, bldgTopLayer2, mid);
		}
		else
		{
			sideRotation(obj, bldgTop, bldgTopLayer2, legs, mid);
		}

		dirn = obj.dirn;
		com = obj.com;
		cor = obj.cor;
		bldgSide = obj.bldgSide;

		tmHandle = window.setTimeout(draw, 1000 / fps);
	}

	let tmHandle = window.setTimeout(draw, 1000 / fps);
})
