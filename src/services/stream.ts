import redis from '../db/redis';
import Xev from 'xev';
import { User } from '../models/entities/user';
import { Note } from '../models/entities/note';
import { UserList } from '../models/entities/user-list';
import config from '../config';

class Publisher {
	private ev: Xev | null = null;

	constructor() {
		// Redisがインストールされてないときはプロセス間通信を使う
		if (redis == null) {
			this.ev = new Xev();
		}
	}

	private publish = (channel: string, type: string | null, value?: any): void => {
		const message = type == null ? value : value == null ?
			{ type: type, body: null } :
			{ type: type, body: value };

		if (this.ev) {
			this.ev.emit(channel, message);
		} else {
			redis!.publish('misskey', JSON.stringify({
				channel: channel,
				message: message
			}));
		}
	}

	public publishMainStream = (userId: User['id'], type: string, value?: any): void => {
		this.publish(`mainStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishDriveStream = (userId: User['id'], type: string, value?: any): void => {
		this.publish(`driveStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishNoteStream = (noteId: Note['id'], type: string, value: any): void => {
		this.publish(`noteStream:${noteId}`, type, {
			id: noteId,
			body: value
		});
	}

	public publishUserListStream = (listId: UserList['id'], type: string, value?: any): void => {
		this.publish(`userListStream:${listId}`, type, typeof value === 'undefined' ? null : value);
	}

	public publishNotesStream = (note: any): void => {
		this.publish('notesStream', null, note);
	}

	public publishApLogStream = (log: any): void => {
		this.publish('apLog', null, log);
	}

	public publishAdminStream = (userId: User['id'], type: string, value?: any): void => {
		this.publish(`adminStream:${userId}`, type, typeof value === 'undefined' ? null : value);
	}
}

const publisher = new Publisher();

export default publisher;

export const publishMainStream = publisher.publishMainStream;
export const publishDriveStream = publisher.publishDriveStream;
export const publishNoteStream = publisher.publishNoteStream;
export const publishNotesStream = publisher.publishNotesStream;
export const publishUserListStream = publisher.publishUserListStream;
export const publishApLogStream = publisher.publishApLogStream;
export const publishAdminStream = publisher.publishAdminStream;
