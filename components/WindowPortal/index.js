import React from 'react';
import Portal from '../Portal';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number,
    onClose: PropTypes.func,
};

const defaultProps = {
    width: 600,
    height: 400,
    top: 200,
    left: 200,
    onClose: () => {},
};

export default class WindowPortal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
    }

     componentWillReceiveProps(nextProps){
      if(nextProps.width!==this.props.width || nextProps.height !== this.props.height) {
          this.externalWindow.resizeTo(nextProps.width, nextProps.height);
      }

      if(nextProps.top!==this.props.top || nextProps.left !== this.props.left) {
          this.externalWindow.moveTo(nextProps.top, nextProps.left);
      }
    } 

    render() {
        const { children } = this.props;
        return (
            <Portal
                container={this.containerEl}>
                {children}
            </Portal>
        );
    }

    componentDidMount() {
        const { width, height, left, top, onClose } = this.props;
        this.externalWindow = window.open('', '', `width=${width},height=${height},left=${left},top=${top}`);

        // append the container  to the body of the new window
        this.externalWindow.document.body.appendChild(this.containerEl);

        this.externalWindow.addEventListener('beforeunload', () => {
            onClose();
        });
    }

    componentWillUnmount() {
        this.externalWindow.close();
    }
}
