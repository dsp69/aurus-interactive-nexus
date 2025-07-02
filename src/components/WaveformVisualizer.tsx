interface WaveformVisualizerProps {
  isActive: boolean;
}

export const WaveformVisualizer = ({ isActive }: WaveformVisualizerProps) => {
  const bars = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center space-x-1 h-16">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`waveform-bar transition-all duration-300 ${
            isActive 
              ? 'animate-waveform opacity-100' 
              : 'h-1 opacity-50'
          }`}
          style={{
            animationDelay: `${bar * 0.1}s`,
            width: '4px',
          }}
        />
      ))}
    </div>
  );
};