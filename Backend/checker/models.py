from django.db import models
from django.utils import timezone
import uuid

class DomainScan(models.Model):
    """
    Model to store domain scan results and analysis data
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    domain = models.CharField(max_length=255, db_index=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    risk_score = models.PositiveSmallIntegerField(default=0)
    is_suspicious = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False)  # Whether the domain is flagged for investigation
    scan_result = models.JSONField(default=dict)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    registrar = models.CharField(max_length=255, null=True, blank=True)
    creation_date = models.DateTimeField(null=True, blank=True)
    expiration_date = models.DateTimeField(null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50, default='New')
    notes = models.TextField(null=True, blank=True)
    scan_date = models.DateTimeField(default=timezone.now)
    last_scan_date = models.DateTimeField(null=True, blank=True)
    last_flagged_date = models.DateTimeField(null=True, blank=True)  # When the domain was last flagged
    
    class Meta:
        verbose_name = "Domain Scan"
        verbose_name_plural = "Domain Scans"
        ordering = ['-scan_date']
        indexes = [
            models.Index(fields=['domain']),
            models.Index(fields=['is_suspicious']),
            models.Index(fields=['is_flagged']),  # Add index for flagged domains
            models.Index(fields=['scan_date']),
            models.Index(fields=['risk_score']),
        ]
    
    def __str__(self):
        flagged_status = "Flagged" if self.is_flagged else ""
        risk_status = "Suspicious" if self.is_suspicious else "Safe" 
        return f"{self.domain} - Score: {self.risk_score} - {risk_status} {flagged_status}"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure risk_score is within valid range and set is_suspicious
        based on risk_score threshold
        """
        # Ensure risk_score is between 0 and 100
        self.risk_score = max(0, min(100, self.risk_score))
        
        # Mark domains with risk_score over 60 as suspicious
        self.is_suspicious = self.risk_score > 60
        
        super().save(*args, **kwargs)
