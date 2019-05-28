import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Flappy = ({ isFacist, userInfo, gameInfo, socket }) => {
	const cb = new Image();

	cb.src = '/images/default_cardback.png';

	// for some unknown reason useState doesn't work here - it never updates inside of draw
	let vert = 50;
	let lastFlapTime = Date.now() - 1000;
	const pylonCoords = [];

	const draw = () => {
		const ctx = document.getElementById(isFacist ? 'flappy-canvas-2' : 'flappy-canvas-1').getContext('2d');
		const timeDiff = Date.now() - lastFlapTime;

		vert = vert - (1000 - timeDiff) * 0.0015;

		ctx.clearRect(0, 0, 650, 220);
		ctx.drawImage(cb, 10, Math.floor(vert), 42, 57);

		pylonCoords.forEach(coord => {
			const pipeGradient = ctx.createLinearGradient(coord.x, 0, coord.x + 50, 50 + coord.offset);

			pipeGradient.addColorStop(0, '#87B145');
			pipeGradient.addColorStop(1, '#5B7E2C');
			ctx.fillStyle = pipeGradient;
			ctx.fillRect(coord.x, 0, 40, 50 + coord.offset / 2);
			ctx.fillRect(coord.x, 40 + coord.offset / 2 + 140, 40, 220);
			coord.x = coord.x - 1;
		});

		window.requestAnimationFrame(draw);
	};

	const flap = () => {
		socket.emit('flappyEvent', {
			uid: gameInfo.general.uid,
			team: isFacist ? 'fascist' : 'liberal',
			type: 'flap'
		});
	};

	useEffect(() => {
		setTimeout(() => {
			socket.emit('flappyEvent', {
				uid: gameInfo.general.uid,
				type: 'startFlappy'
			});
		}, 500);

		socket.on('flappyUpdate', data => {
			if (data.type === 'flap' && ((isFacist && data.team == 'fascist') || (!isFacist && data.team === 'liberal'))) {
				lastFlapTime = Date.now();
			}

			if (data.type === 'startFlappy') {
				draw();
			}

			if (data.type === 'newPylon') {
				pylonCoords.push({
					offset: data.offset,
					x: 751
				});
			}
		});
	}, []);

	return (
		<canvas
			width="750"
			height="220"
			id={isFacist ? 'flappy-canvas-2' : 'flappy-canvas-1'}
			style={{ background: 'linear-gradient(to bottom, #7db9e8 0%, #1e5799 100%)' }}
			onClick={flap}
		/>
	);
};

Flappy.propTypes = {
	userInfo: PropTypes.object,
	gameInfo: PropTypes.object,
	socket: PropTypes.object,
	isFacist: PropTypes.bool
};

export default Flappy;
