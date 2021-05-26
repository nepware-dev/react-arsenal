export const getErrorMessage = (error) => {
    if(error.error) {
        return error.error;
    }
    if(error.detail) {
        return error.detail;
    }
    if (error.non_field_errors) {
        return error.non_field_errors[0];
    }
    if(error.message) {
        return error.message;
    }
    return 'An error occured!';
};

