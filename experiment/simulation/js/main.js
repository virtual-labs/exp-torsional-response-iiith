//Your JavaScript goes in here

document.addEventListener('DOMContentLoaded', function(){

	const playButton = document.getElementById('play');
	const pauseButton = document.getElementById('pause');
	const restartButton = document.getElementById('restart');

	pauseButton.addEventListener('click', function() { window.clearTimeout(tmHandle); });
	playButton.addEventListener('click', function() {  window.clearTimeout(tmHandle); tmHandle = setTimeout(draw, 1000 / fps); });
	restartButton.addEventListener('click', function() {restart();});

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		bldg = [
			[[upL[0], defY], [upR[0], defY], [startR[0], defY + height], [startL[0], defY + height]],
			[[upL[1], defY], [upR[1], defY], [startR[1], defY + height], [startL[1], defY + height]],
			[[upL[2], defY], [upR[2], defY], [startR[2], defY + height], [startL[2], defY + height]]
		];

		ground = [
			[startL[0] - 50, defY + height + 40],
			[startL[0], defY + height - 40],
			[startR[2] + 50, defY + height - 40],
			[startR[2], defY + height + 40],
		];

		layer2 = [
			{...ground[0]},
			[ground[0][0], defY + height + 40 + thickness],
			[startR[2] + thickness, defY + height + 40 + thickness],
			[ground[2][0] + thickness, defY + height - 40 + thickness],
			{...ground[2]},
			{...ground[3]},
		];

		dirn = -1;
		tmHandle = window.setTimeout(draw, 1000 / fps); 
	}

	const slider_mot = document.getElementById("motion");
	const output_mot = document.getElementById("demo_motion");
	output_mot.innerHTML = slider_mot.value; // Display the default slider value

	// Update the current slider value (each time you drag the slider handle)
	slider_mot.oninput = function() {
		output_mot.innerHTML = this.value;
		vibe = Number(document.getElementById("motion").value);
		restart();
	};

	function calc(mass, stiff, com, cor, bldgTop)
	{
		let totm = 0;
		com[0] = 0;
		com[1] = 0;

		mass.forEach(function(value, i) {
			totm += value;
			let temp = [value * (bldgTop[0][0] + bldgTop[3][0]) / 4, value * (bldgTop[0][1] + bldgTop[1][1]) / 4];

			if(i > 1)
				temp[0] *= 3;

			if(i == 0 || i == 3)
				temp[1] *= 3;

			com[0] += temp[0];
			com[1] += temp[1];
		});
		
		com[0] /= totm;
		com[1] /= totm;
	}

	function curvedArea(ctx, e, gradX, gradY)
	{
		ctx.bezierCurveTo(e[0], e[1] += gradY, e[0] += gradX, e[1] += gradY, e[0] += gradX, e[1]);
		ctx.bezierCurveTo(e[0] += gradX, e[1], e[0] += gradX, e[1] -= gradY, e[0], e[1] -= gradY);
	}

	function updateGround(ground, layer2, chg)
	{
		ground.forEach(g => {
			g[0] += chg;
		});

		layer2.forEach(l => {
			l[0] += chg;
		});
	}

	function drawGround(ctx, ground)
	{
		ctx.save();
		ctx.fillStyle = "pink";
		ctx.beginPath();
		ctx.moveTo(ground[0][0], ground[0][1]);

		for(let i = 0; i < ground.length; ++i)
		{
			let next = (i + 1) % ground.length;
			ctx.lineTo(ground[next][0], ground[next][1]);
		}

		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	let vibe = 30;
	let mass = [1, 1, 1, 1];
	let stiff = [30, 30, 30, 30];
	let com = [0, 0];	//center of mass
	let cor = [0, 0];	//center of stiffness/resistance

	const canvas = document.getElementById("main");
	canvas.width = 1200;
	canvas.height = 600;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");

	const fill = "#A9A9A9";
	const border = "black";
	const lineWidth = 1.5;

	const fps = 15;
	let dirn = -1;
	let scale = 5;

	const defY = 200;
	const breadth = 50;
	const height = 300;
	const startL = [250, 250 + breadth, 850, 850 + breadth];
	const startR = [startL[0] + breadth, startL[1] + breadth, startL[2] + breadth, startL[3] + breadth];
	const thickness = 20;

	let bldgTop = [
		[startL[0] - 50, defY - thickness],
		[startR[0], defY - 150 - thickness],
		[startL[3], defY - 150 - thickness],
		[startR[3] + 50, defY - thickness],
	];

	let bldgTopLayer2 = [
		[bldgTop[0][0], defY],
		[bldgTop[0][0], defY - thickness],
		[bldgTop[3][0], defY - thickness],
		[bldgTop[3][0], defY],
	];

	let legs = [
		[[startL[0], defY], [startR[0], defY], [startR[0], defY + height], [startL[0], defY + height]],
		[[startL[1], defY], [startR[1], defY], [startR[1], defY + 2 * height / 3], [startL[1], defY + 2 * height / 3]],
		[[startL[2], defY], [startR[2], defY], [startR[2], defY + 2 * height / 3], [startL[2], defY + 2 * height / 3]],
		[[startL[3], defY], [startR[3], defY], [startR[3], defY + height], [startL[3], defY + height]]
	];

	let ground = [
		[startL[0] - 50, defY + height + 40],
		[startL[0], defY + height - 40],
		[startR[2] + 50, defY + height - 40],
		[startR[2], defY + height + 40],
	];
	
	let layer2 = [
		{...ground[0]},
		[ground[0][0], defY + height + 40 + thickness],
		[startR[2] + thickness, defY + height + 40 + thickness],
		[ground[2][0] + thickness, defY + height - 40 + thickness],
		{...ground[2]},
		{...ground[3]},
	];

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = fill;
		ctx.lineWidth = lineWidth;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		calc(mass, stiff, com, cor, bldgTop);
		ctx.fillStyle = "red";
		ctx.fillRect(com[0], com[1], 4, 100);
		ctx.fillStyle = fill;

		if(dirn == -1)
		{
			updateGround(ground, layer2, vibe / scale);
		}

		else
		{
			updateGround(ground, layer2, -1 * vibe / scale);
		}

		drawGround(ctx, bldgTop);
		drawGround(ctx, bldgTopLayer2);

		for(let k = 0; k < 4; ++k)
		{
			let v = legs[k];

			//if(dirn == -1)
			//{
				//v[0][0] -= vibe / scale;
				//v[1][0] -= vibe / scale;
				//v[2][0] += vibe / scale;
				//v[3][0] += vibe / scale;
			//}

			//else
			//{
				//v[0][0] += vibe / scale;
				//v[1][0] += vibe / scale;
				//v[2][0] -= vibe / scale;
				//v[3][0] -= vibe / scale;
			//}

			//if(k == 2 && (v[0][0] <= upL[k] - vibe || v[1][0] >= upR[k] + vibe))
			//{
				//dirn *= -1;
			//}

			ctx.beginPath();
			ctx.moveTo(v[0][0], v[0][1]);

			for(let i = 0; i < v.length; ++i)
			{
				let next = (i + 1) % v.length;
				let ratio = 0.5;
				let ctrl = [(v[i][0] + v[next][0]) * ratio, (v[i][1] + v[next][1]) * ratio];

				ctx.quadraticCurveTo(ctrl[0], ctrl[1], v[next][0], v[next][1]);
			}

			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			legs[k] = v;
		}

		tmHandle = window.setTimeout(draw, 1000 / fps);
	}

	let tmHandle = window.setTimeout(draw, 1000 / fps);
})
