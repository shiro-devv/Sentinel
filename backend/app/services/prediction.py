"""
Prediction module for disaster forecasting using time series analysis.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import deque
import math
from loguru import logger
from app.core.config import settings


class PredictionResult:
    """Container for prediction results."""
    
    def __init__(
        self,
        predicted_value: float,
        confidence_score: float,
        interval_lower: float,
        interval_upper: float,
        forecast_horizon_hours: int,
        escalation_probability: float,
        risk_level: str,
        model_name: str,
    ):
        self.predicted_value = predicted_value
        self.confidence_score = confidence_score
        self.interval_lower = interval_lower
        self.interval_upper = interval_upper
        self.forecast_horizon_hours = forecast_horizon_hours
        self.escalation_probability = escalation_probability
        self.risk_level = risk_level
        self.model_name = model_name
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "predicted_value": self.predicted_value,
            "confidence_score": self.confidence_score,
            "interval_lower": self.interval_lower,
            "interval_upper": self.interval_upper,
            "forecast_horizon_hours": self.forecast_horizon_hours,
            "escalation_probability": self.escalation_probability,
            "risk_level": self.risk_level,
            "model_name": self.model_name,
        }


class TimeSeriesData:
    """Stores time series data for predictions."""
    
    def __init__(self, max_points: int = 1000):
        self.max_points = max_points
        self.values: deque = deque(maxlen=max_points)
        self.timestamps: deque = deque(maxlen=max_points)
    
    def add(self, value: float, timestamp: Optional[datetime] = None):
        """Add a data point."""
        self.values.append(value)
        self.timestamps.append(timestamp or datetime.utcnow())
    
    def get_recent(self, hours: int) -> List[tuple]:
        """Get data from the last N hours."""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        result = []
        
        for ts, val in zip(self.timestamps, self.values):
            if ts >= cutoff:
                result.append((ts, val))
        
        return result
    
    @property
    def size(self) -> int:
        return len(self.values)


class RollingAveragePredictor:
    """Simple predictor using exponential weighted moving average."""
    
    def __init__(self, alpha: float = 0.3):
        self.alpha = alpha  # Smoothing factor (0-1)
        self.ewma: Optional[float] = None
    
    def update(self, value: float) -> float:
        """Update EWMA with new value."""
        if self.ewma is None:
            self.ewma = value
        else:
            self.ewma = self.alpha * value + (1 - self.alpha) * self.ewma
        return self.ewma
    
    def predict(self, steps_ahead: int = 1) -> float:
        """Predict future value (constant forecast for simple EWMA)."""
        return self.ewma or 0.0
    
    def get_prediction_interval(
        self,
        recent_errors: List[float],
        confidence: float = 0.95,
    ) -> tuple:
        """Calculate prediction interval based on recent errors."""
        if not recent_errors:
            return (0.0, 0.0)
        
        # Calculate standard error
        mean_error = sum(recent_errors) / len(recent_errors)
        variance = sum((e - mean_error) ** 2 for e in recent_errors) / max(1, len(recent_errors) - 1)
        std_error = math.sqrt(variance)
        
        # Z-score for confidence level (95% = 1.96, 99% = 2.58)
        z_score = 2.0 if confidence >= 0.95 else 1.645
        
        margin = z_score * std_error
        
        prediction = self.predict()
        return (prediction - margin, prediction + margin)


class LinearRegressionPredictor:
    """Predictor using simple linear regression."""
    
    def __init__(self, lookback: int = 48):
        self.lookback = lookback
        self.slope = 0.0
        self.intercept = 0.0
        self.r_squared = 0.0
    
    def fit(self, values: List[float]) -> None:
        """Fit linear regression to values."""
        n = len(values)
        if n < 2:
            return
        
        # Use indices as x values
        x_vals = list(range(n))
        
        # Calculate means
        x_mean = sum(x_vals) / n
        y_mean = sum(values) / n
        
        # Calculate slope and intercept
        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, values))
        denominator = sum((x - x_mean) ** 2 for x in x_vals)
        
        if denominator != 0:
            self.slope = numerator / denominator
            self.intercept = y_mean - self.slope * x_mean
        
        # Calculate R-squared
        if n > 2:
            y_pred = [self.intercept + self.slope * x for x in x_vals]
            ss_res = sum((y - yp) ** 2 for y, yp in zip(values, y_pred))
            ss_tot = sum((y - y_mean) ** 2 for y in values)
            
            if ss_tot != 0:
                self.r_squared = 1 - (ss_res / ss_tot)
    
    def predict(self, steps_ahead: int = 1) -> float:
        """Predict future value."""
        # Predict for next step after the fitted data
        x_future = self.lookback + steps_ahead - 1
        return self.intercept + self.slope * x_future


class EscalationPredictor:
    """Predicts probability of disaster escalation."""
    
    def __init__(self):
        self.history_size = 100
        self.severity_history: deque = deque(maxlen=self.history_size)
    
    def add_severity(self, severity_score: float):
        """Add a severity observation."""
        self.severity_history.append(severity_score)
    
    def predict_escalation(self, current_severity: float) -> float:
        """Predict probability of escalation (0-1)."""
        if len(self.severity_history) < 5:
            return 0.5  # Default uncertainty
        
        recent = list(self.severity_history)[-10:]
        
        # Calculate trend
        if len(recent) >= 2:
            changes = [recent[i] - recent[i-1] for i in range(1, len(recent))]
            avg_change = sum(changes) / len(changes)
        else:
            avg_change = 0
        
        # Calculate probability based on trend and current level
        if avg_change > 5:
            trend_factor = min(0.4, avg_change * 0.02)
        elif avg_change < -5:
            trend_factor = max(-0.3, avg_change * 0.01)
        else:
            trend_factor = 0
        
        # Base probability increases with severity
        base_prob = min(0.8, current_severity / 100)
        
        # Apply trend factor
        probability = max(0.0, min(1.0, base_prob + trend_factor))
        
        return probability


class PredictionEngine:
    """Main prediction engine orchestrating multiple predictors."""
    
    def __init__(self):
        self.earthquake_data = TimeSeriesData()
        self.rainfall_data = TimeSeriesData()
        self.wind_data = TimeSeriesData()
        
        self.earthquake_predictor = RollingAveragePredictor(alpha=0.2)
        self.rainfall_predictor = RollingAveragePredictor(alpha=0.3)
        self.wind_predictor = RollingAveragePredictor(alpha=0.25)
        
        self.escalation_predictor = EscalationPredictor()
        self.recent_errors: Dict[str, List[float]] = {
            "earthquake": [],
            "rainfall": [],
            "wind": [],
        }
    
    def add_earthquake_data(self, magnitude: float, timestamp: Optional[datetime] = None):
        """Add earthquake magnitude data."""
        self.earthquake_data.add(magnitude, timestamp)
        self.earthquake_predictor.update(magnitude)
    
    def add_rainfall_data(self, rainfall: float, timestamp: Optional[datetime] = None):
        """Add rainfall data."""
        self.rainfall_data.add(rainfall, timestamp)
        self.rainfall_predictor.update(rainfall)
    
    def add_wind_data(self, wind_speed: float, timestamp: Optional[datetime] = None):
        """Add wind speed data."""
        self.wind_data.add(wind_speed, timestamp)
        self.wind_predictor.update(wind_speed)
    
    def add_severity(self, severity_score: float):
        """Add severity score for escalation prediction."""
        self.escalation_predictor.add_severity(severity_score)
    
    def predict_earthquake(
        self,
        forecast_hours: int = None,
    ) -> PredictionResult:
        """Predict future earthquake magnitude."""
        horizon = forecast_hours or settings.PREDICTION_FORECAST_HOURS
        
        predicted_value = self.earthquake_predictor.predict(steps_ahead=horizon)
        
        # Get prediction interval
        lower, upper = self.earthquake_predictor.get_prediction_interval(
            self.recent_errors.get("earthquake", []),
            confidence=0.95,
        )
        
        # Confidence based on data quantity
        data_points = self.earthquake_data.size
        confidence = min(0.9, data_points / 100)
        
        # Escalation probability
        current_mag = list(self.earthquake_data.values)[-1] if self.earthquake_data.size > 0 else 0
        escalation_prob = self.escalation_predictor.predict_escalation(current_mag * 10)
        
        # Risk level
        risk_level = self._get_risk_level(predicted_value, escalation_prob)
        
        return PredictionResult(
            predicted_value=predicted_value,
            confidence_score=confidence,
            interval_lower=max(0, lower),
            interval_upper=upper,
            forecast_horizon_hours=horizon,
            escalation_probability=escalation_prob,
            risk_level=risk_level,
            model_name="rolling_average_ewma",
        )
    
    def predict_rainfall(
        self,
        forecast_hours: int = None,
    ) -> PredictionResult:
        """Predict future rainfall."""
        horizon = forecast_hours or settings.PREDICTION_FORECAST_HOURS
        
        predicted_value = self.rainfall_predictor.predict(steps_ahead=horizon)
        
        lower, upper = self.rainfall_predictor.get_prediction_interval(
            self.recent_errors.get("rainfall", []),
            confidence=0.95,
        )
        
        data_points = self.rainfall_data.size
        confidence = min(0.9, data_points / 100)
        
        current_rain = list(self.rainfall_data.values)[-1] if self.rainfall_data.size > 0 else 0
        escalation_prob = self.escalation_predictor.predict_escalation(current_rain)
        
        risk_level = self._get_risk_level(predicted_value / 10, escalation_prob)
        
        return PredictionResult(
            predicted_value=predicted_value,
            confidence_score=confidence,
            interval_lower=max(0, lower),
            interval_upper=upper,
            forecast_horizon_hours=horizon,
            escalation_probability=escalation_prob,
            risk_level=risk_level,
            model_name="rolling_average_ewma",
        )
    
    def predict_wind(
        self,
        forecast_hours: int = None,
    ) -> PredictionResult:
        """Predict future wind speed."""
        horizon = forecast_hours or settings.PREDICTION_FORECAST_HOURS
        
        predicted_value = self.wind_predictor.predict(steps_ahead=horizon)
        
        lower, upper = self.wind_predictor.get_prediction_interval(
            self.recent_errors.get("wind", []),
            confidence=0.95,
        )
        
        data_points = self.wind_data.size
        confidence = min(0.9, data_points / 100)
        
        current_wind = list(self.wind_data.values)[-1] if self.wind_data.size > 0 else 0
        escalation_prob = self.escalation_predictor.predict_escalation(current_wind)
        
        risk_level = self._get_risk_level(predicted_value / 30, escalation_prob)
        
        return PredictionResult(
            predicted_value=predicted_value,
            confidence_score=confidence,
            interval_lower=max(0, lower),
            interval_upper=upper,
            forecast_horizon_hours=horizon,
            escalation_probability=escalation_prob,
            risk_level=risk_level,
            model_name="rolling_average_ewma",
        )
    
    def _get_risk_level(self, value: float, escalation_prob: float) -> str:
        """Determine risk level from predicted value and escalation probability."""
        combined_risk = value * 0.7 + escalation_prob * 30
        
        if combined_risk > 70:
            return "CRITICAL"
        elif combined_risk > 50:
            return "HIGH"
        elif combined_risk > 30:
            return "MEDIUM"
        else:
            return "LOW"
    
    def get_trend_analysis(self, metric: str = "earthquake") -> Dict[str, Any]:
        """Get trend analysis for a specific metric."""
        if metric == "earthquake":
            data = list(self.earthquake_data.values)
        elif metric == "rainfall":
            data = list(self.rainfall_data.values)
        elif metric == "wind":
            data = list(self.wind_data.values)
        else:
            return {}
        
        if len(data) < 10:
            return {"trend": "insufficient_data"}
        
        # Calculate linear trend
        recent = data[-48:]  # Last 48 points
        n = len(recent)
        
        x_mean = (n - 1) / 2
        y_mean = sum(recent) / n
        
        numerator = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(recent))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        
        slope = numerator / denominator if denominator != 0 else 0
        
        if slope > 0.1:
            trend = "increasing"
        elif slope < -0.1:
            trend = "decreasing"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "slope": slope,
            "current_value": recent[-1] if recent else 0,
            "average": y_mean,
            "data_points": n,
        }


# Singleton instance
prediction_engine = PredictionEngine()
