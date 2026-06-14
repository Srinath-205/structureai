import { AppLayout } from '@/components/layout/AppLayout';
import { useDesignStore } from '@/stores/designStore';
import { StepProject } from './StepProject';
import { StepDesignCode } from './StepDesignCode';
import { StepNLP } from './StepNLP';
import { StepLoads } from './StepLoads';
import { StepColumn } from './StepColumn';
import { StepBasePlate } from './StepBasePlate';
import { StepConcrete } from './StepConcrete';
import { StepAnchors } from './StepAnchors';
import { StepCalculate } from './StepCalculate';
import { StepResults } from './StepResults';

const STEP_COMPONENTS = {
  project: StepProject,
  design_code: StepDesignCode,
  nlp: StepNLP,
  loads: StepLoads,
  column: StepColumn,
  baseplate: StepBasePlate,
  concrete: StepConcrete,
  anchors: StepAnchors,
  calculate: StepCalculate,
  results: StepResults,
};

const Index = () => {
  const { currentStep } = useDesignStore();
  const StepComponent = STEP_COMPONENTS[currentStep] ?? StepProject;

  return (
    <AppLayout>
      <StepComponent />
    </AppLayout>
  );
};

export default Index;
