import { Outlet } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';

function MainLayout() {
    return (
        <div>
            <Header />
                <div className='container'>
                    <main className='main-content'>
                        <Outlet />
                    </main>
                </div>
            <Footer />
        </div>
    );
}

export default MainLayout;