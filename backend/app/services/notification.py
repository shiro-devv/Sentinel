"""
Notification service for SMS and Email (simulated).
"""
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from loguru import logger
from app.core.config import settings


class NotificationService:
    """Service for sending notifications (SMS and Email simulation)."""
    
    def __init__(self):
        self.logger = logger.bind(notification=True)
    
    async def send_sms(self, alert) -> bool:
        """Send SMS notification (simulated)."""
        try:
            phone_number = self._get_notification_phone()
            
            message = self._format_sms_message(alert)
            
            # Simulate SMS sending
            await asyncio.sleep(0.1)  # Simulate network delay
            
            self.logger.info(
                f"SMS sent to {phone_number}: {message[:50]}..."
            )
            
            logger.info(f"SMS notification sent for alert {alert.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            return False
    
    async def send_email(self, alert) -> bool:
        """Send email notification (simulated)."""
        try:
            email_address = self._get_notification_email()
            
            subject, body = self._format_email_message(alert)
            
            # Simulate email sending
            await asyncio.sleep(0.1)
            
            self.logger.info(
                f"Email sent to {email_address}: {subject}"
            )
            
            logger.info(f"Email notification sent for alert {alert.id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    def _format_sms_message(self, alert) -> str:
        """Format SMS message from alert."""
        severity_emoji = {
            "LOW": "⚠️",
            "MEDIUM": "🔶",
            "HIGH": "🔴",
            "CRITICAL": "🚨",
        }
        
        emoji = severity_emoji.get(alert.severity, "⚠️")
        
        message = (
            f"{emoji} DISASTER ALERT [{alert.severity}]\n"
            f"Type: {alert.alert_type}\n"
            f"Location: {alert.location_name or 'Unknown'}\n"
            f"Time: {alert.event_time.strftime('%Y-%m-%d %H:%M UTC')}\n"
        )
        
        if alert.magnitude:
            message += f"Magnitude: {alert.magnitude}\n"
        if alert.wind_speed:
            message += f"Wind: {alert.wind_speed} mph\n"
        
        message += f"\n{alert.title}"
        
        return message
    
    def _format_email_message(self, alert) -> tuple[str, str]:
        """Format email subject and body from alert."""
        subject = f"[{alert.severity}] Disaster Alert: {alert.alert_type} - {alert.location_name or 'Location Unknown'}"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color: {'red' if alert.severity == 'CRITICAL' else 'orange' if alert.severity == 'HIGH' else 'blue'};">
                ⚠️ Disaster Alert - {alert.severity}
            </h2>
            
            <table style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Alert Type:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{alert.alert_type}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Severity:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{alert.severity}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{alert.location_name or 'Unknown'}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Time:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{alert.event_time.strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
                </tr>
                {'<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Magnitude:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + str(alert.magnitude) + '</td></tr>' if alert.magnitude else ''}
                {'<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Wind Speed:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + str(alert.wind_speed) + ' mph</td></tr>' if alert.wind_speed else ''}
                {'<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Rainfall:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' + str(alert.rainfall) + ' mm/hr</td></tr>' if alert.rainfall else ''}
            </table>
            
            <h3>Description</h3>
            <p>{alert.description or 'No additional details available.'}</p>
            
            <p style="color: #666; font-size: 12px;">
                This is an automated alert from the Disaster Detection System.
                Alert ID: {alert.id}
            </p>
        </body>
        </html>
        """
        
        return subject, body
    
    def _get_notification_phone(self) -> str:
        """Get notification phone number (configurable)."""
        # In production, this would come from user preferences or config
        return "+1-555-0100"
    
    def _get_notification_email(self) -> str:
        """Get notification email address (configurable)."""
        # In production, this would come from user preferences or config
        return "alerts@disasterdetector.com"
    
    async def send_bulk_sms(self, alerts: list) -> Dict[str, bool]:
        """Send SMS to multiple recipients."""
        results = {}
        for alert in alerts:
            results[alert.id] = await self.send_sms(alert)
        return results
    
    async def send_bulk_email(self, alerts: list) -> Dict[str, bool]:
        """Send emails to multiple recipients."""
        results = {}
        for alert in alerts:
            results[alert.id] = await self.send_email(alert)
        return results
