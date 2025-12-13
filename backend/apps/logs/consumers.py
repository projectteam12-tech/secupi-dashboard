import json
from channels.generic.websocket import AsyncWebsocketConsumer


class LogConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time log updates.
    """
    async def connect(self):
        self.group_name = 'logs'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def log_message(self, event):
        """
        Receive message from room group and send to WebSocket.
        """
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'log',
            'data': message
        }))


class AlertConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time alert updates.
    """
    async def connect(self):
        self.group_name = 'alerts'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def alert_message(self, event):
        """
        Receive message from room group and send to WebSocket.
        """
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'data': message
        }))



