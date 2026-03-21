"""
WebSocket handler for real-time alert streaming.
"""
import asyncio
import json
from datetime import datetime
from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscriptions: Dict[str, Set[str]] = {
            "alerts": set(),
            "metrics": set(),
            "predictions": set(),
        }
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.subscriptions["alerts"].add(client_id)  # Default subscription
        logger.info(f"WebSocket client connected: {client_id}")
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        for topic in self.subscriptions.values():
            topic.discard(client_id)
        
        logger.info(f"WebSocket client disconnected: {client_id}")
    
    async def send_personal_message(self, message: dict, client_id: str):
        """Send message to specific client."""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to {client_id}: {str(e)}")
                self.disconnect(client_id)
    
    async def broadcast_to_topic(self, topic: str, message: dict):
        """Broadcast message to all clients subscribed to a topic."""
        disconnected = []
        
        for client_id in self.subscriptions.get(topic, set()):
            if client_id in self.active_connections:
                try:
                    await self.active_connections[client_id].send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {str(e)}")
                    disconnected.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def broadcast_alert(self, alert_data: dict):
        """Broadcast alert to all alert subscribers."""
        message = {
            "type": "alert",
            "timestamp": datetime.utcnow().isoformat(),
            "data": alert_data,
        }
        await self.broadcast_to_topic("alerts", message)
    
    async def broadcast_metric_update(self, metrics_data: dict):
        """Broadcast metrics update to subscribers."""
        message = {
            "type": "metrics",
            "timestamp": datetime.utcnow().isoformat(),
            "data": metrics_data,
        }
        await self.broadcast_to_topic("metrics", message)
    
    async def broadcast_prediction(self, prediction_data: dict):
        """Broadcast prediction update to subscribers."""
        message = {
            "type": "prediction",
            "timestamp": datetime.utcnow().isoformat(),
            "data": prediction_data,
        }
        await self.broadcast_to_topic("predictions", message)
    
    def subscribe(self, client_id: str, topic: str):
        """Subscribe client to a topic."""
        if topic in self.subscriptions:
            self.subscriptions[topic].add(client_id)
            logger.info(f"Client {client_id} subscribed to {topic}")
    
    def unsubscribe(self, client_id: str, topic: str):
        """Unsubscribe client from a topic."""
        if topic in self.subscriptions:
            self.subscriptions[topic].discard(client_id)
            logger.info(f"Client {client_id} unsubscribed from {topic}")
    
    @property
    def connection_count(self) -> int:
        return len(self.active_connections)
    
    def get_stats(self) -> dict:
        """Get connection statistics."""
        return {
            "total_connections": self.connection_count,
            "alert_subscribers": len(self.subscriptions["alerts"]),
            "metrics_subscribers": len(self.subscriptions["metrics"]),
            "prediction_subscribers": len(self.subscriptions["predictions"]),
        }


# Global connection manager
manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time updates."""
    import uuid
    client_id = str(uuid.uuid4())
    
    await manager.connect(websocket, client_id)
    
    try:
        # Send welcome message
        await manager.send_personal_message(
            {
                "type": "connected",
                "client_id": client_id,
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Connected to Disaster Detector real-time feed",
            },
            client_id,
        )
        
        while True:
            # Receive messages from client
            data = await websocket.receive_json()
            
            await handle_client_message(client_id, data)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(client_id)


@router.websocket("/ws/alerts")
async def alerts_websocket_endpoint(websocket: WebSocket):
    """Dedicated WebSocket endpoint for alert updates."""
    import uuid
    client_id = str(uuid.uuid4())
    
    await manager.connect(websocket, client_id)
    manager.subscribe(client_id, "alerts")
    
    try:
        await manager.send_personal_message(
            {
                "type": "connected",
                "topic": "alerts",
                "client_id": client_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
            client_id,
        )
        
        while True:
            data = await websocket.receive_json()
            await handle_client_message(client_id, data)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(client_id)


async def handle_client_message(client_id: str, data: dict):
    """Handle incoming messages from WebSocket clients."""
    message_type = data.get("type")
    
    if message_type == "subscribe":
        topic = data.get("topic", "alerts")
        manager.subscribe(client_id, topic)
        await manager.send_personal_message(
            {"type": "subscribed", "topic": topic},
            client_id,
        )
    
    elif message_type == "unsubscribe":
        topic = data.get("topic", "alerts")
        manager.unsubscribe(client_id, topic)
        await manager.send_personal_message(
            {"type": "unsubscribed", "topic": topic},
            client_id,
        )
    
    elif message_type == "ping":
        await manager.send_personal_message(
            {"type": "pong", "timestamp": datetime.utcnow().isoformat()},
            client_id,
        )
    
    elif message_type == "get_stats":
        await manager.send_personal_message(
            {"type": "stats", "data": manager.get_stats()},
            client_id,
        )
    
    else:
        logger.warning(f"Unknown message type from {client_id}: {message_type}")


# Redis pub/sub integration for real-time alerts
class RedisPubSubHandler:
    """Handles Redis pub/sub for real-time alert distribution."""
    
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.pubsub = None
    
    async def start(self, redis_client):
        """Start listening to Redis pub/sub."""
        self.pubsub = redis_client.pubsub()
        await self.pubsub.subscribe("alerts", "predictions", "metrics")
        
        asyncio.create_task(self._listen())
    
    async def _listen(self):
        """Listen for messages from Redis."""
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                topic = message["channel"].decode()
                data = json.loads(message["data"])
                
                if topic == "alerts":
                    await manager.broadcast_alert(data)
                elif topic == "predictions":
                    await manager.broadcast_prediction(data)
                elif topic == "metrics":
                    await manager.broadcast_metric_update(data)
    
    async def publish_alert(self, redis_client, alert_data: dict):
        """Publish alert to Redis."""
        await redis_client.publish("alerts", json.dumps(alert_data))
    
    async def publish_prediction(self, redis_client, prediction_data: dict):
        """Publish prediction to Redis."""
        await redis_client.publish("predictions", json.dumps(prediction_data))


# Utility functions for publishing updates
async def publish_alert_update(alert_data: dict):
    """Publish alert update through WebSocket."""
    await manager.broadcast_alert(alert_data)


async def publish_metrics_update(metrics_data: dict):
    """Publish metrics update through WebSocket."""
    await manager.broadcast_metric_update(metrics_data)


async def publish_prediction_update(prediction_data: dict):
    """Publish prediction update through WebSocket."""
    await manager.broadcast_prediction(prediction_data)
