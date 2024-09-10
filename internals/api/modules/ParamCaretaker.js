class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class ParamCaretaker {
    validateType(paramName, paramValue, expectedType) {
        if (expectedType === 'int') {
            const parsedValue = parseInt(paramValue, 10);
            if (isNaN(parsedValue)) {
                throw new ValidationError(`${paramName} should be an integer`);
            }
        } else if (expectedType === 'float') {
            const parsedValue = parseFloat(paramValue);
            if (isNaN(parsedValue)) {
                throw new ValidationError(`${paramName} should be a floating point number`);
            }
        } else if (expectedType === 'string' && typeof paramValue !== 'string') {
            throw new ValidationError(`${paramName} should be a string`);
        }
    }

    validateLength(paramName, paramValue, expectedLength) {
        if (typeof paramValue === 'string' && paramValue.length !== expectedLength) {
            throw new ValidationError(`${paramName} should have a length of ${expectedLength}`);
        }
    }

    validateRange(paramName, paramValue, range) {
        if (typeof paramValue === 'number' && (paramValue < range[0] || paramValue > range[1])) {
            throw new ValidationError(`${paramName} should be in the range [${range[0]}, ${range[1]}]`);
        }
    }

    validateValues(paramName, paramValue, allowedValues) {
        const valuesToCheck = paramValue.split(' ');
        for (const value of valuesToCheck) {
            if (allowedValues && allowedValues.indexOf(value) === -1) {
                throw new ValidationError(`${paramName} should have a value among ${allowedValues.join(', ')}`);
            }
        }
    }

    validate(endpoint, requestData) {
        try {
            const missingParameters = endpoint.params.filter(param => param.mandatory && !requestData[param.name]);
            if (missingParameters.length > 0) {
                throw new ValidationError(`Parameter(s) required missing: ${missingParameters.map(param => param.name).join(', ')}`);
            }

            Object.keys(requestData).forEach(paramName => {
                const endpointsParams = endpoint.params;
                const foundParam = endpointsParams.find(param => param.name === paramName);
                if (foundParam) {
                    if (foundParam.length) {
                        this.validateLength(paramName, requestData[paramName], foundParam.length);
                    }
                    if (foundParam.type) {
                        this.validateType(paramName, requestData[paramName], foundParam.type);
                    }
                    if (foundParam.range) {
                        this.validateRange(paramName, requestData[paramName], foundParam.range);
                    }
                    if (foundParam.values) {
                        this.validateValues(paramName, requestData[paramName], foundParam.values);
                    }
                } else {
                    throw new ValidationError(`Unknown parameter: ${paramName}`);
                }
            });
            return null;
        } catch (error) {
            if (error instanceof ValidationError) {
                return {
                    error: error.message,
                    status_code: 400
                };
            }
            throw error;
        }
    }
}

module.exports = ParamCaretaker;
