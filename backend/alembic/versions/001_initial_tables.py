# Alembic migration version file
"""create initial tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial tables."""
    
    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('alert_type', sa.String(50), nullable=False, index=True),
        sa.Column('severity', sa.String(20), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),
        sa.Column('location_name', sa.String(255), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('magnitude', sa.Float, nullable=True),
        sa.Column('depth', sa.Float, nullable=True),
        sa.Column('wind_speed', sa.Float, nullable=True),
        sa.Column('rainfall', sa.Float, nullable=True),
        sa.Column('source', sa.String(100), nullable=False, server_default='USGS'),
        sa.Column('external_id', sa.String(255), nullable=True, index=True),
        sa.Column('event_data', postgresql.JSONB, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_anomaly', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('acknowledged', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('event_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sms_sent', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('email_sent', sa.Boolean, nullable=False, server_default='false'),
    )
    
    # Create events_raw table
    op.create_table(
        'events_raw',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False, index=True),
        sa.Column('external_id', sa.String(255), nullable=True, unique=True, index=True),
        sa.Column('source', sa.String(100), nullable=False),
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),
        sa.Column('depth', sa.Float, nullable=True),
        sa.Column('location_name', sa.String(255), nullable=True),
        sa.Column('place', sa.String(500), nullable=True),
        sa.Column('magnitude', sa.Float, nullable=True),
        sa.Column('magnitude_type', sa.String(50), nullable=True),
        sa.Column('intensity', sa.Float, nullable=True),
        sa.Column('temperature', sa.Float, nullable=True),
        sa.Column('humidity', sa.Float, nullable=True),
        sa.Column('pressure', sa.Float, nullable=True),
        sa.Column('wind_speed', sa.Float, nullable=True),
        sa.Column('wind_direction', sa.Float, nullable=True),
        sa.Column('rainfall', sa.Float, nullable=True),
        sa.Column('raw_data', postgresql.JSONB, nullable=True),
        sa.Column('normalized_data', postgresql.JSONB, nullable=True),
        sa.Column('is_processed', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('event_time', sa.DateTime(timezone=True), nullable=False, index=True),
    )
    
    # Create predictions table
    op.create_table(
        'predictions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('prediction_type', sa.String(50), nullable=False, index=True),
        sa.Column('region', sa.String(255), nullable=True),
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),
        sa.Column('radius_km', sa.Float, nullable=True),
        sa.Column('predicted_value', sa.Float, nullable=False),
        sa.Column('confidence_score', sa.Float, nullable=False),
        sa.Column('prediction_interval_lower', sa.Float, nullable=True),
        sa.Column('prediction_interval_upper', sa.Float, nullable=True),
        sa.Column('model_name', sa.String(100), nullable=False, server_default='rolling_average'),
        sa.Column('model_version', sa.String(50), nullable=True),
        sa.Column('features_used', postgresql.JSONB, nullable=True),
        sa.Column('forecast_horizon_hours', sa.Integer, nullable=False),
        sa.Column('predicted_for_time', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('prediction_made_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('escalation_probability', sa.Float, nullable=True),
        sa.Column('risk_level', sa.String(20), nullable=True),
        sa.Column('actual_value', sa.Float, nullable=True),
        sa.Column('prediction_error', sa.Float, nullable=True),
        sa.Column('is_validated', sa.String(20), nullable=False, server_default='pending'),
    )
    
    # Create indexes
    op.create_index('idx_alerts_event_time', 'alerts', ['event_time'])
    op.create_index('idx_alerts_severity_type', 'alerts', ['severity', 'alert_type'])
    op.create_index('idx_events_processed', 'events_raw', ['is_processed', 'event_time'])
    op.create_index('idx_predictions_type_time', 'predictions', ['prediction_type', 'predicted_for_time'])


def downgrade() -> None:
    """Drop all tables."""
    op.drop_table('predictions')
    op.drop_table('events_raw')
    op.drop_table('alerts')
