// hooks/useIndicators.js - Add risk predictions hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import indicatorService from '../services/indicatorService';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const indicatorKeys = {
  all: ['indicators'],
  lists: () => [...indicatorKeys.all, 'list'],
  list: (filters) => [...indicatorKeys.lists(), { filters }],
  details: () => [...indicatorKeys.all, 'detail'],
  detail: (id, type) => [...indicatorKeys.details(), id, type],
  assignments: () => [...indicatorKeys.all, 'assignments'],
  myAssignments: () => [...indicatorKeys.assignments(), 'me'],
  results: (id, type) => [...indicatorKeys.all, 'results', id, type],
  predictions: (id, type) => [...indicatorKeys.all, 'predictions', id, type],
};

// Get all indicators
export const useIndicators = () => {
  return useQuery({
    queryKey: indicatorKeys.lists(),
    queryFn: indicatorService.getIndicators,
    select: (data) => ({
      leading: data.leading || [],
      lagging: data.lagging || [],
    }),
  });
};

// Get single indicator
export const useIndicator = (id, type) => {
  return useQuery({
    queryKey: indicatorKeys.detail(id, type),
    queryFn: () => indicatorService.getIndicator({ id, type }),
    enabled: !!id && !!type,
  });
};

// Get indicator details
export const useIndicatorDetails = (id, type) => {
  return useQuery({
    queryKey: [...indicatorKeys.detail(id, type), 'details'],
    queryFn: () => indicatorService.getIndicatorDetails({ id, type }),
    enabled: !!id && !!type,
  });
};

// Get indicator results
export const useIndicatorResults = (id, type) => {
  return useQuery({
    queryKey: indicatorKeys.results(id, type),
    queryFn: () => indicatorService.getIndicatorResults({ id, type }),
    enabled: !!id && !!type,
  });
};

// Get risk predictions
export const useRiskPredictions = (id, type) => {
  return useQuery({
    queryKey: indicatorKeys.predictions(id, type),
    queryFn: () => indicatorService.getRiskPredictions({ id, type }),
    enabled: !!id && !!type,
    // Generate mock predictions if none exist
    select: (data) => {
      if (data && data.length > 0) return data;
      
      // Generate mock predictions based on indicator type
      const predictions = [];
      
      if (type === 'leading') {
        predictions.push(
          {
            id: 1,
            title: 'Training Compliance Risk',
            description: 'Based on current training completion rates, there is a risk of insufficient safety training for new employees.',
            probability: 65,
            confidence: 85,
            severity: 'medium',
            impact: 'moderate',
            timeframe: 'next 30 days',
            overall_risk: 6.5,
            time_horizon: 'short-term',
            factors: [
              { name: 'New hires without training', impact: 'high' },
              { name: 'Expired certifications', impact: 'medium' },
              { name: 'Low inspection scores', impact: 'medium' }
            ],
            recommendations: [
              'Schedule refresher training for all operators',
              'Implement automated certification tracking',
              'Increase inspection frequency in high-risk areas'
            ]
          },
          {
            id: 2,
            title: 'Equipment Failure Risk',
            description: 'Maintenance records indicate potential equipment failures in material handling equipment.',
            probability: 45,
            confidence: 75,
            severity: 'high',
            impact: 'severe',
            timeframe: 'next 60 days',
            overall_risk: 7.2,
            time_horizon: 'medium-term',
            factors: [
              { name: 'Delayed preventive maintenance', impact: 'high' },
              { name: 'Older equipment (>10 years)', impact: 'high' },
              { name: 'Increased breakdown frequency', impact: 'medium' }
            ],
            recommendations: [
              'Schedule comprehensive equipment inspection',
              'Prioritize maintenance backlog',
              'Consider equipment replacement plan'
            ]
          },
          {
            id: 3,
            title: 'Near Miss Escalation',
            description: 'Recent near miss reports show patterns that could lead to actual incidents.',
            probability: 35,
            confidence: 80,
            severity: 'high',
            impact: 'severe',
            timeframe: 'next 90 days',
            overall_risk: 5.8,
            time_horizon: 'medium-term',
            factors: [
              { name: 'Increasing near miss frequency', impact: 'high' },
              { name: 'Similar incident patterns', impact: 'high' },
              { name: 'Inadequate corrective actions', impact: 'medium' }
            ],
            recommendations: [
              'Analyze near miss root causes',
              'Implement additional safety controls',
              'Conduct safety stand-down meeting'
            ]
          }
        );
      } else {
        predictions.push(
          {
            id: 1,
            title: 'Recurring Incident Pattern',
            description: 'Similar incident types have occurred multiple times, indicating systemic issues.',
            probability: 75,
            confidence: 90,
            severity: 'high',
            impact: 'critical',
            timeframe: 'next 15 days',
            overall_risk: 8.5,
            time_horizon: 'short-term',
            factors: [
              { name: 'Repeat incident types', impact: 'high' },
              { name: 'Ineffective corrective actions', impact: 'high' },
              { name: 'Inadequate training', impact: 'medium' }
            ],
            recommendations: [
              'Conduct detailed root cause analysis',
              'Review and strengthen control measures',
              'Provide targeted retraining'
            ]
          },
          {
            id: 2,
            title: 'Severity Escalation Risk',
            description: 'Recent incidents show increasing severity, could lead to major injury or fatality.',
            probability: 55,
            confidence: 85,
            severity: 'critical',
            impact: 'catastrophic',
            timeframe: 'next 30 days',
            overall_risk: 9.2,
            time_horizon: 'short-term',
            factors: [
              { name: 'Increasing injury severity', impact: 'high' },
              { name: 'High-risk activities', impact: 'high' },
              { name: 'Inadequate PPE usage', impact: 'high' }
            ],
            recommendations: [
              'Immediate safety intervention required',
              'Conduct high-risk activity assessment',
              'Enforce strict PPE compliance'
            ]
          },
          {
            id: 3,
            title: 'Compliance Risk',
            description: 'Incident patterns may trigger regulatory reporting requirements or violations.',
            probability: 40,
            confidence: 70,
            severity: 'medium',
            impact: 'moderate',
            timeframe: 'next 45 days',
            overall_risk: 6.0,
            time_horizon: 'medium-term',
            factors: [
              { name: 'OSHA recordable incidents', impact: 'high' },
              { name: 'Reporting delays', impact: 'medium' },
              { name: 'Documentation gaps', impact: 'medium' }
            ],
            recommendations: [
              'Review regulatory requirements',
              'Improve incident documentation',
              'Conduct compliance audit'
            ]
          }
        );
      }
      
      return predictions;
    }
  });
};

// Create indicator mutation
export const useCreateIndicator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: indicatorService.createIndicator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicatorKeys.lists() });
      toast({
        title: 'Success',
        variant: "success",
        description: 'Indicator created successfully!',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to create indicator',
      });
    },
  });
};

// Delete indicator mutation
export const useDeleteIndicator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: indicatorService.deleteIndicator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicatorKeys.lists() });
      toast({
        title: 'Success',
        variant: "success",
        description: 'Indicator deleted successfully!',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to delete indicator',
      });
    },
  });
};

// Get my assignments
export const useMyAssignments = () => {
  return useQuery({
    queryKey: indicatorKeys.myAssignments(),
    queryFn: indicatorService.getMyAssignments,
    select: (data) => ({
      leading: data.leading || [],
      lagging: data.lagging || [],
    }),
  });
};

// Update assignment status mutation
export const useUpdateAssignmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: indicatorService.updateAssignmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: indicatorKeys.myAssignments(),
      });
      toast({
        title: 'Success',
        variant: "success",
        description: 'Status updated successfully!',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to update status',
      });
    },
  });
};

// Assign indicator mutation
export const useAssignIndicator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: indicatorService.assignIndicator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicatorKeys.lists() });
      toast({
        title: 'Success',
        variant: "success",
        description: 'Indicator assigned successfully!',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to assign indicator',
      });
    },
  });
};

// Get available users
export const useAvailableUsers = (user) => {
  return useQuery({
    queryKey: ['users', 'available', user?.role, user?.group_id, user?.team_id],
    queryFn: () =>
      indicatorService.getAvailableUsers({
        role: user?.role,
        groupId: user?.group_id,
        teamId: user?.team_id,
      }),
    enabled: !!user,
  });
};

// Upload document mutation
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: indicatorService.uploadDocument,
    onSuccess: (data) => {
      if (data.analysis?.indicators?.length > 0) {
        toast({
          title: 'Upload Complete',
          description: `Document uploaded! ${data.analysis.indicators.length} indicators found.`,
        });
        // Invalidate indicators list to show new auto-created indicators
        queryClient.invalidateQueries({ queryKey: indicatorKeys.lists() });
      } else {
        toast({
          title: 'Upload Complete',
          description: 'Document uploaded successfully!',
        });
      }
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Upload failed',
      });
    },
  });
};

// Share result mutation
export const useShareResult = () => {
  return useMutation({
    mutationFn: indicatorService.shareResult,
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.share_url);
      toast({
        title: 'Copied',
        description: 'Share link copied to clipboard!',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to share result',
      });
    },
  });
};

// Get shared result
export const useSharedResult = (shareToken) => {
  return useQuery({
    queryKey: ['shared', 'result', shareToken],
    queryFn: () => indicatorService.getSharedResult(shareToken),
    enabled: !!shareToken,
    retry: false,
    staleTime: Infinity,
  });
};