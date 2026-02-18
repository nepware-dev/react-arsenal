import Input, { type InputProps } from '../Input';

const RadioInput: React.FC<Omit<InputProps, 'type'>> = (props) => {
    return <Input type="radio" {...props} />;
};

export default RadioInput;
