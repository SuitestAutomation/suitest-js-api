import * as suitest from '../../index';

suitest.image({apiId: 'image-api-id'});
suitest.image({url: 'https://suite.st'});
suitest.image({filepath: 'some-image.png'});
suitest.image({filepath: 'some-image.png', accuracy: suitest.ACCURACY.LOW});


async function testImageChain() {
	await suitest.image({url: 'https://suite.st'})
		.visible();
	await suitest.image({url: 'https://suite.st'})
		.visible()
		.timeout(3000);
	await suitest.image({url: 'https://suite.st'})
		.not()
		.visible();
	await suitest.image({url: 'https://suite.st'})
		.not()
		.visible()
		.timeout(3000);
	await suitest.image({url: 'https://suite.st'})
		.visible()
		.not();
	await suitest.image({url: 'https://suite.st'})
		.visible()
		.not()
		.timeout(3000);
	await suitest.image({url: 'https://suite.st'})
		.visible()
		.inRegion([10, 10, 10, 10]);
	await suitest.image({url: 'https://suite.st'})
		.visible()
		.inRegion([10, 10, 10, 10])
		.timeout(3000);
	await suitest.image({url: 'https://suite.st'})
		.not()
		.visible()
		.inRegion([10, 10, 10, 10]);
	await suitest.image({url: 'https://suite.st'})
		.not()
		.visible()
		.inRegion([10, 10, 10, 10])
		.toAssert();
	await suitest.image({url: 'https://suite.st'})
		.not()
		.visible()
		.inRegion([10, 10, 10, 10])
		.toAssert()
		.timeout(3000);
	await suitest.image({url: 'https://suite.st'})
		.timeout(3000)
		.isNot()
		.visible();
}

