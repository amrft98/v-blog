import React, { useEffect, useState } from 'react';
import './page.css';
import ResponsiveAppBar from "./bar"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SplitButton from './option';
import { AuthContext } from "./authContext";
function Pagecreate() {
    const navigate = useNavigate();
    const intialPage=parseInt(localStorage.getItem('currentPagemypage'))||1;
    const [post0, setpost] = useState([]);
    const [userid, setiduser] = useState("");
    const [page,setPage]=useState(intialPage);
    const [totalPages,setTotalPages]=useState(1);
    const {token}=React.useContext(AuthContext);
    useEffect(() => {
        
        const showpage = async () => {
            try {
                const response = await axios.get(`https://v-blog-4grx.onrender.com/api/my-page?page=${page}`, {headers:{Authorization:`Bearer ${token}`}},{ withCredentials: true });
                if (response.data.message !== 'true') {
                    navigate("/");
                }
                else {
                    setpost([...response.data.data]);
                    setiduser(response.data.userid);
                    setTotalPages(response.data.totalPages);
                }
            }

            catch (err) {
                if (err.response.status ===401||err.response.status===500) {
                    navigate("/");
                }
            }
        };
        showpage();
   
    }, [page]);
    function deleteItem(id){
        setpost(preitems=>{
        return preitems.filter((item)=>{
        return item.id !==id;
        })
        })
        }
        useEffect(()=>{
            localStorage.setItem('currentPagemypage',page);
            },[page]);
    return (
        <div>
            <ResponsiveAppBar />
            {post0.map((item, number) => {
                
                return <div key={item.id} className="task" >
                    <div className="tags">
                        <span className="tag">{item.post_title}</span>
                        <SplitButton onChecked={deleteItem} value={item.id} userid={userid} postuserid={item.id_post} />
                        



                    </div>

                    <p>{item.post}</p>
                    <div className="stats">
                        <div><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path stroke-linecap="round" stroke-width="2" d="M12 8V12L15 15"></path> <circle stroke-width="2" r="9" cy="12" cx="12"></circle> </g></svg>{item.date}</div>
                        <div><svg xmlns="http://www.w3.org/2000/svg" href='/adas' fill="none" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M16 10H16.01M12 10H12.01M8 10H8.01M3 10C3 4.64706 5.11765 3 12 3C18.8824 3 21 4.64706 21 10C21 15.3529 18.8824 17 12 17C11.6592 17 11.3301 16.996 11.0124 16.9876L7 21V16.4939C4.0328 15.6692 3 13.7383 3 10Z"></path> </g></svg><a onClick={()=>{navigate(`/profile/${item.id_post}`)}}>{`${item.first_name} ${item.last_name}`}</a></div>
                    </div>
                </div>

            })}
               <div className="page-div">
<button className="page" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
     
        </button>
        <span>Page {page} of {totalPages}</span>
        <button className="page" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
        </div>
        </div>

    );
}




export default Pagecreate;