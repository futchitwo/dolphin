/**
 * Config loader
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Source, Mixin } from './types';
import * as pkg from '../../package.json';

/**
 * Path of configuration directory
 */
const dir = `${__dirname}/../../.config`;

/**
 * Path of configuration file
 */
const path = process.env.NODE_ENV == 'test'
	? `${dir}/test.yml`
	: `${dir}/default.yml`;

export default function load() {
	let config = {} as Source;

	try {
		config = yaml.load(fs.readFileSync(path, 'utf-8')) as Source;
	} catch (e) {
		console.error('Read Config Error: ' + e);
	}

	config.db.host = process.env.DB_HOST || config.db?.host;
	config.db.port = Number(process.env.DB_PORT) || config.db?.port;
	config.db.db   = process.env.DB_DB   || config.db?.db;
	config.db.user = process.env.DB_USER || config.db?.user;
	config.db.pass = process.env.DB_PASS || config.db?.pass;
	config.db.disableCache = toBoolean(process.env.DB_DISABLE_CACHE) || config.db?.disableCache;
	config.db.extra = config.db?.extra || {};
	config.db.extra.ssl = process.env.DB_SSL || config.db?.extra?.ssl;

	config.drive.storage = config.drive?.storage || 'fs'; 
	config.id = config.id || 'ulid'; 

	const mixin = {} as Mixin;

	const url = tryCreateUrl(config.url);

	config.url = url.origin;

	config.port = config.port || parseInt(process.env.PORT || '', 10);

	config.name = config.name || 'Dolphin';

	mixin.host = url.host;
	mixin.hostname = url.hostname;
	mixin.scheme = url.protocol.replace(/:$/, '');
	mixin.wsScheme = mixin.scheme.replace('http', 'ws');
	mixin.wsUrl = `${mixin.wsScheme}://${mixin.host}`;
	mixin.apiUrl = `${mixin.scheme}://${mixin.host}/api`;
	mixin.authUrl = `${mixin.scheme}://${mixin.host}/auth`;
	mixin.driveUrl = `${mixin.scheme}://${mixin.host}/files`;
	mixin.userAgent = `Dolphin/${pkg.version} (${config.url})`;

	if (config.redis && !config.redis.prefix) config.redis.prefix = mixin.host;

	return Object.assign(config, mixin);
}

function tryCreateUrl(url: string) {
	try {
		return new URL(url);
	} catch (e) {
		throw `url="${url}" is not a valid URL.`;
	}
}

function toBoolean(str = "") {
	return str.toLowerCase() === 'true';
}
