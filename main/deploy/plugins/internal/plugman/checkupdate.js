const fs = require('fs');
const recursive = require('recursive-readdir');
const path = require('path');
const axios = require('axios');
const {validURL, downloadFile} = kb2abot.helpers;

module.exports = {
	keywords: ['checkupdate'],

	name: 'Cập nhật',

	description: 'Kiểm tra cập nhật của các plugin',

	guide: '',

	childs: [],

	permission: {
		'*': 'superAdmin'
	},

	datastoreDesign: {
		account: {
			global: {},
			local: {}
		},
		thread: {
			global: {},
			local: {}
		}
	},

	async onLoad() {
		setInterval(async () => {
			console.newLogger.debug('Dang kiem tra update plugins . . .');
			const files = (await recursive(kb2abot.config.DIR.PLUGIN)).filter(
				file =>
					path.basename(file) == 'manifest.json' &&
					validURL(require(file).update.manifest) &&
					validURL(require(file).update.plugin)
			);
			for (const file of files) {
				const manifest = require(file);
				const {data: tmp_manifest} = await axios.get(manifest.update.manifest);

				const outputFileName = `${manifest.name} ${manifest.version}.zip`;
				const output = path.join(kb2abot.config.DIR.UPDATE, outputFileName);

				if (
					!fs.existsSync(output) &&
					manifest.version != tmp_manifest.version
				) {
					console.newLogger.warn(
						`Phien ban moi! Dang tai ${manifest.name} [${tmp_manifest.version}]!`
					);
					await downloadFile(manifest.update.plugin, output);
					console.newLogger.debug(
						`Da tai xong ${manifest.name} [${tmp_manifest.version}] tai ${output}!`
					);
				}
			}
		}, kb2abot.config.INTERVAL.CHECK_UPDATE);
	},

	hookType: 'none',

	async onMessage(message, reply) {},

	async onCall(message, reply) {
		const files = fs
			.readdirSync(kb2abot.config.DIR.UPDATE)
			.filter(filename => filename.split('.').pop() == 'zip');
		if (files.length > 0)
			reply(
				'Vui lòng tự update (có thể move, delete hoặc extract)\nDanh sách file updates:\n' +
					files.join(', ')
			);
		else reply('Không tìm thấy bản cập nhật nào!');
	}
};
