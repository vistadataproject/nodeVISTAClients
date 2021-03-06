import React from 'react';
import PropTypes from 'prop-types';
import 'font-awesome/css/font-awesome.css';
import '@blueprintjs/core/dist/blueprint.css';
import './auth.css';

function renderOptions(vals) {
    let options = [];
    vals.forEach((val) => {
        options.push(<option key={val.id} value={val.id}>{val.name}</option>);
    });

    return options;
}

function renderErrors(errors) {
    if (!errors) {
        return;
    }
    const errDisplay = [];
    let i = 0;
    errors.forEach((err) => {
        errDisplay.push(<li key={i}>{err}</li>);
        i += 1;
    });

    if (errDisplay.length > 0) {
        return (<ul>{errDisplay}</ul>);
    }
}

const Login = ({ users, facilities, selectedUser, selectedFacility, onSubmit, onChangeUser, onChangeFacility, errors }) => (
    <div className="login-page">
        <form id="login" onSubmit={onSubmit}>
            <div className="login-background">
                <div className="login-form pt-form-group">
                    <h3>Welcome to the VDP Clinical Application</h3>
                    <div className="errors">
                        {renderErrors(errors)}
                    </div>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <label className="pt-label pt-inline">
                                    User:
                                </label>
                            </td>
                            <td>
                                <div className="pt-select pt-disabled">
                                    <select value={selectedUser.id} className="pt-disabled" disabled onChange={onChangeUser}>
                                        <option>Choose User ...</option>
                                        {renderOptions(users)}
                                    </select>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label className="pt-label">
                                    Facility:
                                </label>
                            </td>
                            <td>
                                <div className="pt-select pt-disabled">
                                    <select value={selectedFacility.id} className="pt-disabled" disabled onChange={onChangeFacility}>
                                        <option>Choose Facility ...</option>
                                        {renderOptions(facilities)}
                                    </select>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <button type="submit" className="pt-button pt-intent-primary pt-large">Login</button>
                </div>
            </div>
        </form>
    </div>

);

Login.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};

export default Login;
