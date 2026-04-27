import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { AssessmentData } from '../types';

interface BiologicalFlowChartProps {
  data: AssessmentData;
}

export default function BiologicalFlowChart({ data }: BiologicalFlowChartProps) {
  // Map raw data to numerical scores 0-100
  const scores = [
    { 
      attribute: 'Stress Resilience', 
      value: 100 - (data.stressLevel * 10) 
    },
    { 
      attribute: 'Hydration', 
      value: data.waterIntake === 'Optimal' ? 100 : data.waterIntake === 'Standard' ? 70 : 40 
    },
    { 
      attribute: 'Restoration', 
      value: data.sleepQuality === 'Excellent' ? 100 : data.sleepQuality === 'Average' ? 65 : 30 
    },
    { 
      attribute: 'Vitality', 
      value: data.activityLevel === 'Active' ? 100 : data.activityLevel === 'Moderate' ? 70 : 40 
    },
    { 
      attribute: 'Metabolic Balance', 
      value: data.caffeineIntake === 'None' ? 90 : data.caffeineIntake === 'Moderate' ? 70 : 45 
    }
  ];

  return (
    <div className="w-full h-64 relative" role="img" aria-label="Radar chart showing biological flow scores across stress resilience, hydration, restoration, vitality, and metabolic balance.">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-full h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scores}>
            <PolarGrid stroke="var(--color-brand-sand)" />
            <PolarAngleAxis 
              dataKey="attribute" 
              tick={{ fontSize: 8, fontWeight: 'bold', fill: 'var(--color-brand-moss)', letterSpacing: '0.1em' }}
            />
            <Radar
              name="Biological Flow"
              dataKey="value"
              stroke="var(--color-brand-terracotta)"
              fill="var(--color-brand-terracotta)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
      
      {/* Decorative center element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand-terracotta/20 rounded-full blur-sm" />
    </div>
  );
}
