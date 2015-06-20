from bson.objectid import ObjectId
from bson.json_util import dumps

from openframe.db.frames import Frames
from openframe.db.content import Content
from openframe.handlers.util import _unify_ids


class FrameManager():

    def __init__(self, application):
        self.frames = {}
        self._application = application

        self.pubsub.subscribe(
            'frame:connected', self.add_frame_connection)

        self.pubsub.subscribe(
            'frame:disconnected', self.remove_frame_connection)

        self.pubsub.subscribe(
            'frame:update_content', self.update_frame_content)

    @property
    def application(self):
        return self._application

    @property
    def pubsub(self):
        return self.application.pubsub

    def add_frame_connection(self, frame_ws):
        print('FrameManager::add_frame_connection: ' + frame_ws.frame_id)
        self.frames[frame_ws.frame_id] = frame_ws

        # If the connected frame has current content set, send it along
        # TODO: eventually the frame will store its own latest content state
        if 'current_content' in frame_ws.frame:
            content_id = frame_ws.frame['current_content']['_id']
            self.update_frame_content(frame_ws.frame_id, content_id)

    def remove_frame_connection(self, frame_ws):
        print('FrameManager::remove_frame_connection: ' + frame_ws.frame_id)
        del self.frames[frame_ws.frame_id]

    def update_frame_content(self, frame_id, content_id):
        print(content_id)

        # update the current_content on the frame in the db

        # get content
        content = Content.getById(content_id)
        _unify_ids(content)

        # update frame in db to reflect current content
        frame = Frames.updateById(
            frame_id, {'current_content': content})

        if 'mirrored_by' in frame:
            mirror_frames = frame['mirrored_by']
            print('mirrored_by:' + mirrored_by)

        # publish frame:content_updated event
        self.pubsub.publish(
            'frame:content_updated', frame=frame, content=content)

        # send content to frame if frame connected
        content = Content.getById(content_id)
        if frame_id in self.frames:
            self.frames[frame_id].send('frame:update_content', content)
