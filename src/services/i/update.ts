import renderUpdate from '../../remote/activitypub/renderer/update';
import { renderActivity } from '../../remote/activitypub/renderer';
import { Users } from '../../models';
import { User } from '../../models/entities/user';
import { renderPerson } from '../../remote/activitypub/renderer/person';
import { deliverToFollowers } from '../../remote/activitypub/deliver-manager';
import { deliverToRelays } from '../relay';

export async function publishToFollowers(userId: User['id']) {
	const user = await Users.findOne(userId);
	if (user == null) throw new Error('user not found');

	if (Users.isLocalUser(user)) {
		const content = renderActivity(renderUpdate(await renderPerson(user), user));
		deliverToFollowers(user, content);
		deliverToRelays(user, content);
	}
}
