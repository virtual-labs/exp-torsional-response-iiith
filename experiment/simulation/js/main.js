//Your JavaScript goes in here

document.addEventListener('DOMContentLoaded', function(){

	let view = 0;	//0 --> horizontal, 1 --> vertical(from top)
	let mass = [30, 30, 30, 30];
	let stiff = [30, 30, 30, 30];
	let com = [0, 0];	//center of mass
	let cor = [0, 0];	//center of stiffness/resistance
	let forceDirn = 0;	//0 --> left to right, 1 --> right to left, 2 --> back to front, 3 --> front to back
	const lim = 600;

	const viewButton = document.getElementById('viewButton');
	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

	viewButton.addEventListener('click', function() { window.clearTimeout(tmHandle); view = !view; restart(); });
	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

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

		legs = [
			[[startL[0], defY], [startR[0], defY], [startR[0], defY - height], [startL[0], defY - height]],
			[[startL[1], defY], [startR[1], defY], [startR[1], defY - 2 * height / 3], [startL[1], defY - 2 * height / 3]],
			[[startL[2], defY], [startR[2], defY], [startR[2], defY - 2 * height / 3], [startL[2], defY - 2 * height / 3]],
			[[startL[3], defY], [startR[3], defY], [startR[3], defY - height], [startL[3], defY - height]]
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
		dirn = 0;

		if(cor != mid)
		{
			if(!forceDirn)
			{
				if(cor[1] < mid[1])
				{
					dirn = 1;
				}

				else
				{
					dirn = -1;
				}
			}
		}

		mid = [(bldgTop[0][0] + bldgTop[3][0]) / 2, (bldgTop[0][1] + bldgTop[1][1]) / 2];

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

	function rotation(obj, bldgTop, bldgTopLayer2, mid)
	{
		const angle = 1 * math.PI / 180;
		const rot = [[math.cos(angle), -math.sin(angle)], [math.sin(angle), math.cos(angle)]];

		if(!obj.dirn)
		{
			return;
		}

		let temp = [
			math.subtract(bldgTop[0], mid), 
			math.subtract(bldgTop[1], mid), 
			math.subtract(bldgTop[2], mid), 
			math.subtract(bldgTop[3], mid), 
		];

		if(obj.dirn > 0)
		{
			bldgTop[0] = math.add(math.multiply(rot, temp[0]), mid);
			bldgTop[1] = math.add(math.multiply(rot, temp[1]), mid);
			bldgTop[2] = math.add(math.multiply(rot, temp[2]), mid);
			bldgTop[3] = math.add(math.multiply(rot, temp[3]), mid);
		}

		if(bldgTop[0][1] >= lim || bldgTop[1][1] >= lim || bldgTop[2][1] >= lim || bldgTop[3][1] >= lim)
		{
			obj.dirn = 0;
		}
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

			if(i == 0 || i == 3)
			{
				temp[1] = value * (3 * bldgTop[0][1] + bldgTop[1][1]) / 4;
			}

			center[0] += temp[0];
			center[1] += temp[1];
		});
		
		center[0] /= tot;
		center[1] /= tot;
	}

	//function curvedArea(ctx, e, gradX, gradY)
	//{
		//ctx.bezierCurveTo(e[0], e[1] += gradY, e[0] += gradX, e[1] += gradY, e[0] += gradX, e[1]);
		//ctx.bezierCurveTo(e[0] += gradX, e[1], e[0] += gradX, e[1] -= gradY, e[0], e[1] -= gradY);
	//}

	function drawShape(ctx, v)
	{
		if(!v.length)
		{
			return
		}

		ctx.beginPath();
		ctx.moveTo(v[0][0], 600 - v[0][1]);

		for(let i = 0; i < v.length; ++i)
		{
			let next = (i + 1) % v.length;
			let ratio = 0.5;
			let ctrl = [(v[i][0] + v[next][0]) * ratio, (v[i][1] + v[next][1]) * ratio];

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
	let dirn = 0;	//-1 --> anti-clockwise, 0 --> none, 1 --> clockwise
	let scale = 5;

	const defY = 400;
	const breadth = 50;
	const height = 300;
	const startL = [250, 250 + breadth, 850, 850 + breadth];
	const startR = [startL[0] + breadth, startL[1] + breadth, startL[2] + breadth, startL[3] + breadth];
	const thickness = 20;

	let bldgTop = [
		[startL[0] - 50, defY + thickness],
		[startR[0], defY + 150 + thickness],
		[startL[3], defY + 150 + thickness],
		[startR[3] + 50, defY + thickness],
	];

	let mid = [(bldgTop[0][0] + bldgTop[3][0]) / 2, (bldgTop[0][1] + bldgTop[1][1]) / 2];

	let bldgTopLayer2 = [
		[bldgTop[0][0], defY],
		[bldgTop[0][0], defY + thickness],
		[bldgTop[3][0], defY + thickness],
		[bldgTop[3][0], defY],
	];

	let legs = [
		[[startL[0], defY], [startR[0], defY], [startR[0], defY - height], [startL[0], defY - height]],
		[[startL[1], defY], [startR[1], defY], [startR[1], defY - 2 * height / 3], [startL[1], defY - 2 * height / 3]],
		[[startL[2], defY], [startR[2], defY], [startR[2], defY - 2 * height / 3], [startL[2], defY - 2 * height / 3]],
		[[startL[3], defY], [startR[3], defY], [startR[3], defY - height], [startL[3], defY - height]]
	];

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = fill;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		ctx.save();
		ctx.fillStyle = "pink";
		drawShape(ctx, bldgTop);
		drawShape(ctx, bldgTopLayer2);
		ctx.restore();

		const vertical = [
			[mid[0], bldgTop[1][1]],
			[mid[0], bldgTop[0][1]],
		];
		const horizontal = [
			[(bldgTop[0][0] + bldgTop[1][0]) / 2, mid[1]],
			[(bldgTop[2][0] + bldgTop[3][0]) / 2, mid[1]],
		];

		drawShape(ctx, vertical);
		drawShape(ctx, horizontal);
		ctx.font = "30px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(1, (bldgTop[0][0] + mid[0]) / 2, 600 - (bldgTop[0][1] + mid[1]) / 2);
		ctx.fillText(2, (bldgTop[1][0] + mid[0]) / 2, 600 - (bldgTop[1][1] + mid[1]) / 2);
		ctx.fillText(3, (bldgTop[2][0] + mid[0]) / 2, 600 - (bldgTop[2][1] + mid[1]) / 2);
		ctx.fillText(4, (bldgTop[3][0] + mid[0]) / 2, 600 - (bldgTop[3][1] + mid[1]) / 2);

		ctx.fillStyle = "red";
		ctx.fillRect(com[0] - 2, 600 - com[1] - 2, 4, 4);
		ctx.fillStyle = fill;

		ctx.fillStyle = "blue";
		ctx.fillRect(cor[0] - 2, 600 - cor[1] - 2, 4, 4);
		ctx.fillStyle = fill;

		for(let k = 0; k < legs.length; ++k)
		{
			let v = legs[k];
			drawShape(ctx, v);
			legs[k] = v;
		}

		obj = {dirn: dirn};
		rotation(obj, bldgTop, bldgTopLayer2, mid);
		dirn = obj.dirn;
		tmHandle = window.setTimeout(draw, 1000 / fps);
	}

	let tmHandle = window.setTimeout(draw, 1000 / fps);
})
