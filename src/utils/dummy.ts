/**
 * 一些常见的占位数据
 *
 * @desc
 * 虽然主要用于mock，不过太常见了，还是作为一个工具保留下来
 * 内容不多及时打包也不会影响包体太大
 */
class Dummy {
	videos = {
		// == google的测试视频 ==
		bunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
		elephants: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
		forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
		forBiggerEscapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
		forBiggerFun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
		forBiggerJoyrides: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
		forBiggerMeltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
	}

	video = this.videos.bunny

	images = {
		// == 头像类 ==
		avatar: 'https://i.pravatar.cc/150?img=1',
		avatarFemale: 'https://randomuser.me/api/portraits/women/44.jpg',
		avatarMale: 'https://randomuser.me/api/portraits/men/32.jpg',

		// == picsum（这个会重定向） ==
		landscape: 'https://picsum.photos/800/600',
		portrait: 'https://picsum.photos/600/800',
		square: 'https://picsum.photos/400/400',

		shdcn: 'https://avatars.githubusercontent.com/u/124599?v=4',
		ali: 'https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png',

		// == dummy image ==
		dummyBlack: 'https://dummyimage.com/600x400/000/fff',
		dummyWhite: 'https://dummyimage.com/600x400/fff/000',
		dummyGray: 'https://dummyimage.com/600x400/888/fff',
		dummyRed: 'https://dummyimage.com/600x400/f00/fff',
		dummyGreen: 'https://dummyimage.com/600x400/0f0/fff',
		dummyBlue: 'https://dummyimage.com/600x400/00f/fff',
		dummyYellow: 'https://dummyimage.com/600x400/ff0/fff',
		dummyPurple: 'https://dummyimage.com/600x400/800/fff',
		dummyPink: 'https://dummyimage.com/600x400/f0f/fff',
	}

	avatar = this.images.avatar
	image = this.images.shdcn
	dummyImg = this.images.dummyBlack

	getImage(type: 'landscape' | 'portrait' | 'square' = 'landscape') {
		let size = '400x400'
		if (type === 'landscape') size = '800x600'
		else if (type === 'portrait') size = '600x800'
		return `https://picsum.photos/${size}`
	}

	audios = {
		wav: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
		ogg: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
	}

	audio = this.audios.ogg
}

export const dummy = new Dummy()
