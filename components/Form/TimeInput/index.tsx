import Input, { type InputProps } from '../Input';

const TimeInput: React.FC<Omit<InputProps, 'type'>> = (props) => <Input type="time" {...props} />;

export default TimeInput;
