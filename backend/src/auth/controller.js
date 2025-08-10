import { error } from 'console';
import authService from './service.js';

const loginController = async(req, res) => {
    try{
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error:'Username and Password required' });
        }

        const { role, user, token } =await authService.login(username, password);

        res.json({
            message: 'Login successful',
            token,
            role,
            username: user.username,
            name: user.name,
        });
    } catch (err) {
        res.status(401).json({ error: err.message });   
    }
}

export default { loginController };