import * as suitest from '../../index';

suitest.image('image-api-id');
suitest.image({apiId: 'image-api-id'});
suitest.image({url: 'https://suite.st'});
suitest.image({filepath: 'some-image.png'});
suitest.image({filepath: 'some-image.png'});


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
		.toAssert()
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
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.LOW);
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.MEDIUM);
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.HIGH);
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.HIGH)
		.visible();
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.HIGH)
		.visible()
		.timeout(3000);
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.HIGH)
		.not()
		.visible();
	await suitest.image('image-api-id')
		.accuracy(suitest.ACCURACY.HIGH)
		.not()
		.visible()
		.timeout(3000);

	suitest.image('image-api-id').abandon();
	suitest.image('image-api-id').clone();
	suitest.image('image-api-id').visible().then();
	suitest.image('image-api-id').toString();
}

