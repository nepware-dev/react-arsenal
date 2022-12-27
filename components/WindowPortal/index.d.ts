export interface WindowPortalProps {
    children: any,
    width: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number,
    onClose: PropTypes.func,
    backgroundColor: PropTypes.string
}

declare const WindowPortal;

export default WindowPortal;
