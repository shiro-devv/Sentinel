"""
Anomaly detection module for identifying unusual patterns in disaster data.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import deque
import math
from loguru import logger
from app.core.config import settings


class AnomalyResult:
    """Container for anomaly detection results."""
    
    def __init__(
        self,
        is_anomaly: bool,
        anomaly_type: str,
        severity: float,
        deviation: float,
        moving_average: float,
        description: str,
    ):
        self.is_anomaly = is_anomaly
        self.anomaly_type = anomaly_type
        self.severity = severity
        self.deviation = deviation
        self.moving_average = moving_average
        self.description = description
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_anomaly": self.is_anomaly,
            "anomaly_type": self.anomaly_type,
            "severity": self.severity,
            "deviation": self.deviation,
            "moving_average": self.moving_average,
            "description": self.description,
        }


class TimeSeriesBuffer:
    """Circular buffer for time series data."""
    
    def __init__(self, max_size: int = 100):
        self.max_size = max_size
        self.data: deque = deque(maxlen=max_size)
        self.timestamps: deque = deque(maxlen=max_size)
    
    def add(self, value: float, timestamp: Optional[datetime] = None):
        """Add a new data point."""
        self.data.append(value)
        self.timestamps.append(timestamp or datetime.utcnow())
    
    def get_values(self) -> List[float]:
        """Get all values in buffer."""
        return list(self.data)
    
    def get_recent(self, n: int) -> List[float]:
        """Get n most recent values."""
        return list(self.data)[-n:]
    
    def clear(self):
        """Clear the buffer."""
        self.data.clear()
        self.timestamps.clear()
    
    @property
    def size(self) -> int:
        return len(self.data)


class AnomalyDetector:
    """Detects anomalies in time series data using statistical methods."""
    
    def __init__(self, window_size: int = None, deviation_multiplier: float = None):
        self.window_size = window_size or settings.ANOMALY_WINDOW_SIZE
        self.deviation_multiplier = deviation_multiplier or settings.ANOMALY_DEVIATION_MULTIPLIER
        self.buffers: Dict[str, TimeSeriesBuffer] = {}
    
    def get_buffer(self, key: str) -> TimeSeriesBuffer:
        """Get or create a time series buffer for a key."""
        if key not in self.buffers:
            self.buffers[key] = TimeSeriesBuffer(max_size=self.window_size)
        return self.buffers[key]
    
    def add_data_point(self, key: str, value: float, timestamp: Optional[datetime] = None):
        """Add a data point to the time series."""
        buffer = self.get_buffer(key)
        buffer.add(value, timestamp)
    
    def detect_spike(self, key: str, current_value: float) -> AnomalyResult:
        """Detect spike anomaly using moving average and standard deviation."""
        buffer = self.get_buffer(key)
        
        if buffer.size < 5:
            # Not enough data for meaningful analysis
            return AnomalyResult(
                is_anomaly=False,
                anomaly_type="INSUFFICIENT_DATA",
                severity=0.0,
                deviation=0.0,
                moving_average=current_value,
                description="Insufficient data for anomaly detection",
            )
        
        values = buffer.get_values()
        
        # Calculate moving average and standard deviation
        moving_avg = self._calculate_moving_average(values[:-1])  # Exclude current value
        std_dev = self._calculate_std_dev(values[:-1], moving_avg)
        
        if std_dev == 0:
            std_dev = 0.001  # Prevent division by zero
        
        # Calculate deviation in terms of standard deviations
        deviation = abs(current_value - moving_avg) / std_dev
        
        # Determine if anomaly
        is_anomaly = deviation > self.deviation_multiplier
        
        # Calculate severity (0-100)
        severity = min(100.0, (deviation / self.deviation_multiplier) * 25.0)
        
        # Determine anomaly type
        if current_value > moving_avg:
            anomaly_type = "SPIKE_HIGH"
            direction = "above"
        else:
            anomaly_type = "SPIKE_LOW"
            direction = "below"
        
        # Generate description
        if is_anomaly:
            description = f"Anomalous {direction} average: {current_value:.2f} vs avg {moving_avg:.2f} ({deviation:.1f} std devs)"
        else:
            description = f"Normal variation: {current_value:.2f} ({deviation:.1f} std devs from average)"
        
        return AnomalyResult(
            is_anomaly=is_anomaly,
            anomaly_type=anomaly_type,
            severity=severity,
            deviation=deviation,
            moving_average=moving_avg,
            description=description,
        )
    
    def detect_frequency_anomaly(
        self,
        key: str,
        event_count: int,
        time_window_minutes: int = 60,
    ) -> AnomalyResult:
        """Detect frequency anomalies (unusual number of events in time window)."""
        buffer = self.get_buffer(f"{key}_frequency")
        
        # Add current count
        buffer.add(float(event_count))
        
        if buffer.size < 5:
            return AnomalyResult(
                is_anomaly=False,
                anomaly_type="INSUFFICIENT_DATA",
                severity=0.0,
                deviation=0.0,
                moving_average=float(event_count),
                description="Insufficient data for frequency analysis",
            )
        
        values = buffer.get_values()
        moving_avg = self._calculate_moving_average(values[:-1])
        std_dev = self._calculate_std_dev(values[:-1], moving_avg)
        
        if std_dev == 0:
            std_dev = 1.0
        
        deviation = abs(event_count - moving_avg) / std_dev
        is_anomaly = deviation > self.deviation_multiplier
        
        severity = min(100.0, (deviation / self.deviation_multiplier) * 25.0)
        
        if event_count > moving_avg:
            anomaly_type = "FREQUENCY_SPIKE"
            direction = "increase"
        else:
            anomaly_type = "FREQUENCY_DROP"
            direction = "decrease"
        
        if is_anomaly:
            description = f"Unusual {direction} in events: {event_count} vs avg {moving_avg:.1f}"
        else:
            description = f"Normal event frequency: {event_count}"
        
        return AnomalyResult(
            is_anomaly=is_anomaly,
            anomaly_type=anomaly_type,
            severity=severity,
            deviation=deviation,
            moving_average=moving_avg,
            description=description,
        )
    
    def detect_trend(self, key: str, lookback: int = 10) -> Dict[str, Any]:
        """Detect trending patterns in time series."""
        buffer = self.get_buffer(key)
        
        if buffer.size < lookback:
            return {
                "has_trend": False,
                "direction": "unknown",
                "strength": 0.0,
                "slope": 0.0,
            }
        
        values = buffer.get_recent(lookback)
        
        # Simple linear regression for trend
        n = len(values)
        x_mean = (n - 1) / 2
        y_mean = sum(values) / n
        
        numerator = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            slope = 0
        else:
            slope = numerator / denominator
        
        # Normalize slope to -1 to 1 range
        if y_mean > 0:
            normalized_slope = slope / y_mean
        else:
            normalized_slope = 0
        
        has_trend = abs(normalized_slope) > 0.05
        
        if normalized_slope > 0:
            direction = "increasing"
        elif normalized_slope < 0:
            direction = "decreasing"
        else:
            direction = "stable"
        
        strength = min(1.0, abs(normalized_slope))
        
        return {
            "has_trend": has_trend,
            "direction": direction,
            "strength": strength,
            "slope": slope,
            "normalized_slope": normalized_slope,
        }
    
    def _calculate_moving_average(self, values: List[float]) -> float:
        """Calculate moving average of values."""
        if not values:
            return 0.0
        return sum(values) / len(values)
    
    def _calculate_std_dev(self, values: List[float], mean: float) -> float:
        """Calculate standard deviation of values."""
        if len(values) < 2:
            return 0.0
        
        squared_diffs = [(v - mean) ** 2 for v in values]
        variance = sum(squared_diffs) / (len(values) - 1)
        return math.sqrt(variance)


class MultiMetricAnomalyDetector:
    """Orchestrates anomaly detection across multiple metrics."""
    
    def __init__(self):
        self.earthquake_detector = AnomalyDetector(
            window_size=settings.ANOMALY_WINDOW_SIZE,
            deviation_multiplier=settings.ANOMALY_DEVIATION_MULTIPLIER,
        )
        self.magnitude_detector = AnomalyDetector(window_size=50)
        self.rainfall_detector = AnomalyDetector(window_size=48)
        self.frequency_detector = AnomalyDetector(window_size=24)
    
    def process_earthquake(self, event_data: Dict[str, Any]) -> AnomalyResult:
        """Process earthquake event for anomalies."""
        magnitude = event_data.get("magnitude", 0) or 0
        external_id = event_data.get("external_id", str(id(event_data)))
        
        # Check magnitude anomaly
        result = self.magnitude_detector.detect_spike(f"earthquake_magnitude", magnitude)
        
        # Check frequency
        freq_result = self.frequency_detector.detect_frequency_anomaly("earthquake_frequency", 1)
        
        # Combine results
        if result.is_anomaly or freq_result.is_anomaly:
            return AnomalyResult(
                is_anomaly=True,
                anomaly_type=f"{result.anomaly_type}_{freq_result.anomaly_type}",
                severity=max(result.severity, freq_result.severity),
                deviation=max(result.deviation, freq_result.deviation),
                moving_average=result.moving_average,
                description=f"Earthquake anomaly: {result.description}; {freq_result.description}",
            )
        
        return result
    
    def process_weather(self, event_data: Dict[str, Any]) -> AnomalyResult:
        """Process weather event for anomalies."""
        rainfall = event_data.get("rainfall", 0) or 0
        wind_speed = event_data.get("wind_speed", 0) or 0
        
        # Check rainfall anomaly
        rain_result = self.rainfall_detector.detect_spike("rainfall", rainfall)
        
        # Check wind speed anomaly
        wind_result = AnomalyDetector().detect_spike("wind_speed", wind_speed)
        
        # Return most significant anomaly
        if rain_result.is_anomaly and rain_result.severity >= wind_result.severity:
            return rain_result
        elif wind_result.is_anomaly:
            return wind_result
        
        return AnomalyResult(
            is_anomaly=False,
            anomaly_type="NORMAL",
            severity=0.0,
            deviation=max(rain_result.deviation, wind_result.deviation),
            moving_average=rain_result.moving_average,
            description="No significant anomalies detected",
        )


# Singleton instance
anomaly_detector = MultiMetricAnomalyDetector()
