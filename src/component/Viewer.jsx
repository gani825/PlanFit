

import './Viewer.css';

const Viewer = ({ content }) => {
    return (
        <div className="Viewer">
            <section>
                <div className="content_wrapper">
                    <p>{content}</p>
                </div>
            </section>
        </div>
    );
};

export default Viewer;
