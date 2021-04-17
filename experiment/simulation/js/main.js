//Your JavaScript goes in here

document.addEventListener('DOMContentLoaded', function(){

	let view = 0;	//0 --> horizontal, 1 --> vertical(from top)
	let mass = [30, 30, 30, 30];
	let stiff = [30, 30, 30, 30];
	let com = [0, 0];	//center of mass
	let cor = [0, 0];	//center of stiffness/resistance
	let forceDirn = 0;	//0 --> left to right, 1 --> right to left, 2 --> back to front, 3 --> front to back

	const topLim = 600;
	const sideLim = 100;

	const viewButton = document.getElementById('viewButton');
	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

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
	}

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 
		init();
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const slider_m1 = document.getElementById("mass1");
	const output_m1 = document.getElementById("demo_mass1");
	output_m1.innerHTML = slider_m1.value; // Display the default slider value

	slider_m1.oninput = function() {
		output_m1.innerHTML = this.value;
		mass[0] = Number(document.getElementById("mass1").value);
		restart();
	};

	const slider_m2 = document.getElementById("mass2");
	const output_m2 = document.getElementById("demo_mass2");
	output_m2.innerHTML = slider_m2.value; // Display the default slider value

	slider_m2.oninput = function() {
		output_m2.innerHTML = this.value;
		mass[1] = Number(document.getElementById("mass2").value);
		restart();
	};

	const slider_m3 = document.getElementById("mass3");
	const output_m3 = document.getElementById("demo_mass3");
	output_m3.innerHTML = slider_m3.value; // Display the default slider value

	slider_m3.oninput = function() {
		output_m3.innerHTML = this.value;
		mass[2] = Number(document.getElementById("mass3").value);
		restart();
	};

	const slider_m4 = document.getElementById("mass4");
	const output_m4 = document.getElementById("demo_mass4");
	output_m4.innerHTML = slider_m4.value; // Display the default slider value

	slider_m4.oninput = function() {
		output_m4.innerHTML = this.value;
		mass[3] = Number(document.getElementById("mass4").value);
		restart();
	};

	const slider_s1 = document.getElementById("stiff1");
	const output_s1 = document.getElementById("demo_stiff1");
	output_s1.innerHTML = slider_s1.value; // Display the default slider value

	slider_s1.oninput = function() {
		output_s1.innerHTML = this.value;
		stiff[0] = Number(document.getElementById("stiff1").value);	
		restart();
	};

	const slider_s2 = document.getElementById("stiff2");
	const output_s2 = document.getElementById("demo_stiff2");
	output_s2.innerHTML = slider_s2.value; // Display the default slider value

	slider_s2.oninput = function() {
		output_s2.innerHTML = this.value;
		stiff[1] = Number(document.getElementById("stiff2").value);
		restart();
	};

	const slider_s3 = document.getElementById("stiff3");
	const output_s3 = document.getElementById("demo_stiff3");
	output_s3.innerHTML = slider_s3.value; // Display the default slider value

	slider_s3.oninput = function() {
		output_s3.innerHTML = this.value;
		stiff[2] = Number(document.getElementById("stiff3").value);
		restart();
	};

	const slider_s4 = document.getElementById("stiff4");
	const output_s4 = document.getElementById("demo_stiff4");
	output_s4.innerHTML = slider_s4.value; // Display the default slider value

	slider_s4.oninput = function() {
		output_s4.innerHTML = this.value;
		stiff[3] = Number(document.getElementById("stiff4").value);
		restart();
	};

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

		const temp = [
			math.subtract(bldgTop[0], mid), 
			math.subtract(bldgTop[1], mid), 
			math.subtract(bldgTop[2], mid), 
			math.subtract(bldgTop[3], mid), 
		];
		const tcom = math.subtract(obj.com, mid);
		const tcor = math.subtract(obj.cor, mid);

		bldgTop[0] = math.add(math.multiply(rot, temp[0]), mid);
		bldgTop[1] = math.add(math.multiply(rot, temp[1]), mid);
		bldgTop[2] = math.add(math.multiply(rot, temp[2]), mid);
		bldgTop[3] = math.add(math.multiply(rot, temp[3]), mid);

		if(bldgTopLayer2.length)
		{
			const tempL2 = [
				math.subtract(bldgTopLayer2[0], mid), 
				math.subtract(bldgTopLayer2[1], mid), 
				math.subtract(bldgTopLayer2[2], mid), 
				math.subtract(bldgTopLayer2[3], mid), 
			];

			bldgTopLayer2[0] = math.add(math.multiply(rot, tempL2[0]), mid);
			bldgTopLayer2[1] = math.add(math.multiply(rot, tempL2[1]), mid);
			bldgTopLayer2[2] = math.add(math.multiply(rot, tempL2[2]), mid);
			bldgTopLayer2[3] = math.add(math.multiply(rot, tempL2[3]), mid);
		}

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

		change = 1.5;

		if(obj.dirn < 0)
		{
			bldgTop[0] = [bldgTop[0][0] + 2 * change, bldgTop[0][1] - 3 * change];
			bldgTop[1] = [bldgTop[1][0] - 4 * change, bldgTop[1][1] - 2 * change];
			bldgTop[2] = [bldgTop[2][0] - 1 * change, bldgTop[2][1] - 0.25 * change];
			bldgTop[3] = [bldgTop[3][0] + 2.5 * change, bldgTop[3][1] - 1 * change];
			bldgTopLayer2[0] = [bldgTopLayer2[0][0] + 2 * change, bldgTopLayer2[0][1] - 3 * change];
			bldgTopLayer2[1] = [bldgTopLayer2[1][0] + 2 * change, bldgTopLayer2[1][1] - 3 * change];
			bldgTopLayer2[2] = [bldgTopLayer2[2][0] + 2.5 * change, bldgTopLayer2[2][1] - 1 * change];
			bldgTopLayer2[3] = [bldgTopLayer2[3][0] + 2.5 * change, bldgTopLayer2[3][1] - 1 * change];
			legs[0] = [[legs[0][0][0] + 2 * change, legs[0][0][1] - 2 * change], [legs[0][1][0] + 2 * change, legs[0][1][1] - 2 * change]];
			legs[1] = [[legs[1][0][0] - 3 * change, legs[1][0][1] + 1 * change], [legs[1][1][0] - 3 * change, legs[1][1][1] - 2 * change]];
			legs[2] = [[legs[2][0][0] - 2 * change, legs[2][0][1] - 0.25 * change], [legs[2][1][0] - 2 * change, legs[2][1][1] - 1.25 * change]];
			legs[3] = [[legs[3][0][0] + 1.5 * change, legs[3][0][1] - 1 * change], [legs[3][1][0] + 1.5 * change, legs[3][1][1] - 1 * change]];
		}

		else
		{
			bldgTop[0] = [bldgTop[0][0] - 2.5 * change, bldgTop[0][1] - 1 * change];
			bldgTop[1] = [bldgTop[1][0] + 1 * change, bldgTop[1][1] - 0.25 * change];
			bldgTop[2] = [bldgTop[2][0] + 4 * change, bldgTop[2][1] - 2 * change];
			bldgTop[3] = [bldgTop[3][0] - 2 * change, bldgTop[3][1] - 3 * change];
			bldgTopLayer2[0] = [bldgTopLayer2[0][0] - 2.5 * change, bldgTopLayer2[0][1] - 1 * change];
			bldgTopLayer2[1] = [bldgTopLayer2[1][0] - 2.5 * change, bldgTopLayer2[1][1] - 1 * change];
			bldgTopLayer2[2] = [bldgTopLayer2[2][0] - 2 * change, bldgTopLayer2[2][1] - 3 * change];
			bldgTopLayer2[3] = [bldgTopLayer2[3][0] - 2 * change, bldgTopLayer2[3][1] - 3 * change];
			legs[0] = [[legs[0][0][0] - 1.5 * change, legs[0][0][1] - 1 * change], [legs[0][1][0] - 1.5 * change, legs[0][1][1] - 1 * change]];
			legs[1] = [[legs[1][0][0] + 2 * change, legs[1][0][1] - 0.25 * change], [legs[1][1][0] + 2 * change, legs[1][1][1] - 1.25 * change]];
			legs[2] = [[legs[2][0][0] + 3 * change, legs[2][0][1] + 1 * change], [legs[2][1][0] + 3 * change, legs[2][1][1] - 2 * change]];
			legs[3] = [[legs[3][0][0] - 2 * change, legs[3][0][1] - 2 * change], [legs[3][1][0] - 2 * change, legs[3][1][1] - 2 * change]];
		}

		if(dirn === 1 && bldgTop[2][0] > bldgTop[3][0])
		{
			obj.bldgSide = [
				{...bldgTopLayer2[3]},
				{...bldgTopLayer2[2]},
				{...bldgTop[2]},
				[bldgTop[2][0], bldgTop[2][1] - thickness],
			];
		}

		else if(dirn === -1 && bldgTop[1][0] < bldgTop[0][0])
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

		for(let i = 0; i < v.length; ++i)
		{
			const next = (i + 1) % v.length;
			const ratio = 0.5;
			const ctrl = [(v[i][0] + v[next][0]) * ratio, (v[i][1] + v[next][1]) * ratio];
			ctx.quadraticCurveTo(ctrl[0], 600 - ctrl[1], v[next][0], 600 - v[next][1]);
		}

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

		for(let k = 0; k < legs.length; ++k)
		{
			const v = legs[k];
			ctx.save();
			ctx.lineWidth = 5;
			drawShape(ctx, v);
			ctx.restore();
			legs[k] = v;
		}

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
		if(view)
		{
			ctx.fillText(1, (bldgTop[0][0] + mid[0]) / 2, 600 - (bldgTop[0][1] + mid[1]) / 2);
			ctx.fillText(2, (bldgTop[1][0] + mid[0]) / 2, 600 - (bldgTop[1][1] + mid[1]) / 2);
			ctx.fillText(3, (bldgTop[2][0] + mid[0]) / 2, 600 - (bldgTop[2][1] + mid[1]) / 2);
			ctx.fillText(4, (bldgTop[3][0] + mid[0]) / 2, 600 - (bldgTop[3][1] + mid[1]) / 2);
		}

		ctx.fillStyle = "red";
		ctx.fillRect(com[0] - 2, 600 - com[1] - 2, 4, 4);
		ctx.fillStyle = fill;

		ctx.fillStyle = "blue";
		ctx.fillRect(cor[0] - 2, 600 - cor[1] - 2, 4, 4);
		ctx.fillStyle = fill;

		obj = {
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
