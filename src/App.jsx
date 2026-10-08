import { useEffect, useMemo, useState } from "react";
import "./App.css";

const teams0 = [
  {id:1,name:"Thunder FC",captain:"Arjun",seed:1,status:"Confirmed",players:["Arjun","Rohan"]},
  {id:2,name:"Blaze United",captain:"Rahul",seed:2,status:"Confirmed",players:["Rahul","Vikram"]},
  {id:3,name:"Royal Strikers",captain:"Kiran",seed:3,status:"Confirmed",players:["Kiran","Aman"]},
  {id:4,name:"City Warriors",captain:"Aditya",seed:4,status:"Confirmed",players:["Aditya","Sam"]},
  {id:5,name:"Blue Titans",captain:"Ravi",seed:5,status:"Confirmed",players:["Ravi","Dev"]},
  {id:6,name:"Red Hawks",captain:"Nikhil",seed:6,status:"Pending",players:["Nikhil"]},
  {id:7,name:"Storm Kings",captain:"Manoj",seed:7,status:"Confirmed",players:["Manoj"]},
  {id:8,name:"Fire Dragons",captain:"Varun",seed:8,status:"Pending",players:["Varun"]}
];

function league(teams) {
  let a=[], id=1;
  for(let i=0;i<teams.length;i++)
    for(let j=i+1;j<teams.length;j++)
      a.push({
        id:id++,
        home:teams[i].name,
        away:teams[j].name,
        hs:0,
        as:0,
        status:"Upcoming",
        date:"",
        time:"",
        venue:""
      });
  return a;
}

function bracket(teams) {
  let a=[];
  for(let i=0;i<teams.length;i+=2)
    a.push({
      id:i/2+1,
      home:teams[i]?.name||"TBD",
      away:teams[i+1]?.name||"TBD",
      hs:0,
      as:0,
      status:"Upcoming"
    });
  return a;
}

const old=JSON.parse(localStorage.getItem("tournament"));

const start=old||{
  tournament:{
    name:"Campus Champions League",
    sport:"Football",
    format:"Round Robin"
  },
  teams:teams0,
  matches:league(teams0),
  bracket:bracket(teams0)
};

export default function App(){
  const [data,setData]=useState(start);
  const [page,setPage]=useState("Dashboard");
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({name:"",captain:"",seed:""});
  const [setup,setSetup]=useState(data.tournament);

  useEffect(()=>{
    localStorage.setItem("tournament",JSON.stringify(data));
  },[data]);

  const standings=useMemo(()=>{
    let t=data.teams.map(x=>({
      ...x,mp:0,w:0,d:0,l:0,pts:0,gd:0
    }));

    data.matches.filter(x=>x.status==="Completed").forEach(m=>{
      let a=t.find(x=>x.name===m.home);
      let b=t.find(x=>x.name===m.away);
      if(!a||!b)return;

      a.mp++; b.mp++;
      a.gd+=m.hs-m.as;
      b.gd+=m.as-m.hs;

      if(m.hs>m.as){
        a.w++;a.pts+=3;b.l++;
      }else if(m.as>m.hs){
        b.w++;b.pts+=3;a.l++;
      }else{
        a.d++;b.d++;a.pts++;b.pts++;
      }
    });

    return t.sort((a,b)=>b.pts-a.pts||b.gd-a.gd);
  },[data]);

  function addTeam(e){
    e.preventDefault();
    if(!form.name)return;

    let team={
      id:Date.now(),
      name:form.name,
      captain:form.captain,
      seed:Number(form.seed)||data.teams.length+1,
      status:"Confirmed",
      players:[]
    };

    setData({...data,teams:[...data.teams,team]});
    setForm({name:"",captain:"",seed:""});
  }

  function deleteTeam(id){
    setData({
      ...data,
      teams:data.teams.filter(t=>t.id!==id)
    });
  }

  function addPlayer(id){
    let name=prompt("Enter player name:");
    if(!name)return;

    setData({
      ...data,
      teams:data.teams.map(t=>
        t.id===id?{...t,players:[...t.players,name]}:t
      )
    });
  }

  function generate(){
    let newData={
      ...data,
      tournament:setup,
      matches:setup.format==="Round Robin"
        ?league(data.teams):[],
      bracket:setup.format==="Single Elimination"
        ?bracket(data.teams):[]
    };

    setData(newData);
    setPage("Fixtures");
  }

  function changeMatch(id,key,value){
    setData({
      ...data,
      matches:data.matches.map(m=>
        m.id===id?{...m,[key]:key==="hs"||key==="as"?Number(value):value}:m
      )
    });
  }

  function changeBracket(id,key,value){
    setData({
      ...data,
      bracket:data.bracket.map(m=>
        m.id===id?{...m,[key]:key==="hs"||key==="as"?Number(value):value}:m
      )
    });
  }

  function reset(){
    localStorage.removeItem("tournament");
    location.reload();
  }

  let filtered=data.teams.filter(t=>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div className="app">

      <aside>
        <div className="logo">
          <div className="logoIcon">🏆</div>
          <div>
            <b>TourneyPro</b>
            <small>Organizer Platform</small>
          </div>
        </div>

        <nav>
          {[
            ["Dashboard","⌂"],
            ["Teams","👥"],
            ["Fixtures","⚽"],
            ["Standings","📊"],
            ["Scoring","🎯"]
          ].map(x=>
            <button
              className={page===x[0]?"navActive":""}
              onClick={()=>setPage(x[0])}
              key={x[0]}
            >
              <span>{x[1]}</span>{x[0]}
            </button>
          )}
        </nav>

        <div className="sideBottom">
          <div className="miniBox">
            <span>TOURNAMENT</span>
            <b>{data.tournament.name}</b>
          </div>
          <button className="reset" onClick={reset}>↻ Reset Data</button>
        </div>
      </aside>

      <main>

        <header>
          <div>
            <p className="eyebrow">TOURNAMENT MANAGER</p>
            <h1>{page}</h1>
            <p className="subtitle">
              {data.tournament.sport} · {data.tournament.format}
            </p>
          </div>

          <button className="addBtn" onClick={()=>setPage("Teams")}>
            + Add Team
          </button>
        </header>

        {page==="Dashboard"&&
          <Dashboard data={data} standings={standings}/>
        }

        {page==="Teams"&&
          <section>
            <div className="topGrid">

              <form className="card formCard" onSubmit={addTeam}>
                <div className="sectionTitle">
                  <span className="icon purple">👥</span>
                  <div>
                    <h2>Register Team</h2>
                    <p>Add a new tournament team</p>
                  </div>
                </div>

                <label>TEAM NAME</label>
                <input
                  placeholder="e.g. Bangalore Bulls"
                  value={form.name}
                  onChange={e=>setForm({...form,name:e.target.value})}
                />

                <label>CAPTAIN / CONTACT</label>
                <input
                  placeholder="Captain name"
                  value={form.captain}
                  onChange={e=>setForm({...form,captain:e.target.value})}
                />

                <label>SEED / RATING</label>
                <input
                  type="number"
                  placeholder="1"
                  value={form.seed}
                  onChange={e=>setForm({...form,seed:e.target.value})}
                />

                <button className="fullBtn">Register Team</button>
              </form>

              <div className="card formCard">
                <div className="sectionTitle">
                  <span className="icon cyan">⚙</span>
                  <div>
                    <h2>Tournament Setup</h2>
                    <p>Configure your competition</p>
                  </div>
                </div>

                <label>TOURNAMENT NAME</label>
                <input
                  value={setup.name}
                  onChange={e=>setSetup({...setup,name:e.target.value})}
                />

                <label>SPORT / GAME</label>
                <select
                  value={setup.sport}
                  onChange={e=>setSetup({...setup,sport:e.target.value})}
                >
                  <option>Football</option>
                  <option>Cricket</option>
                  <option>Basketball</option>
                  <option>Esports</option>
                </select>

                <label>FORMAT</label>
                <select
                  value={setup.format}
                  onChange={e=>setSetup({...setup,format:e.target.value})}
                >
                  <option>Round Robin</option>
                  <option>Single Elimination</option>
                </select>

                <button className="fullBtn cyanBtn" onClick={generate}>
                  Generate Tournament
                </button>
              </div>
            </div>

            <div className="card">
              <div className="directoryHead">
                <div>
                  <h2>Team Directory</h2>
                  <p>{data.teams.length} registered teams</p>
                </div>
                <input
                  className="search"
                  placeholder="🔍 Search teams..."
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                />
              </div>

              <div className="teamGrid">
                {filtered.map(t=>
                  <div className="teamCard" key={t.id}>
                    <div className="teamTop">
                      <div className="teamLogo">
                        {t.name.charAt(0)}
                      </div>
                      <span className={
                        t.status==="Confirmed"
                          ?"badge green":"badge yellow"
                      }>
                        {t.status}
                      </span>
                    </div>

                    <h3>{t.name}</h3>
                    <p>Captain: {t.captain}</p>
                    <p>Seed: #{t.seed}</p>

                    <div className="players">
                      👤 {t.players.length} players
                    </div>

                    <div className="teamActions">
                      <button onClick={()=>addPlayer(t.id)}>
                        + Player
                      </button>
                      <button
                        className="danger"
                        onClick={()=>deleteTeam(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        }

        {page==="Fixtures"&&
          <Fixtures
            data={data}
            changeMatch={changeMatch}
            changeBracket={changeBracket}
          />
        }

        {page==="Scoring"&&
          <Scoring
            data={data}
            changeMatch={changeMatch}
            changeBracket={changeBracket}
          />
        }

        {page==="Standings"&&
          <Standings standings={standings}/>
        }

      </main>
    </div>
  );
}

function Dashboard({data,standings}){

  let completed=data.matches.filter(
    m=>m.status==="Completed"
  ).length;

  return(
    <section>

      <div className="hero">
        <div>
          <span className="heroTag">LIVE TOURNAMENT</span>
          <h2>Welcome to your<br/><b>Tournament Command Center</b></h2>
          <p>
            Manage teams, fixtures, scores and standings
            from one powerful dashboard.
          </p>
        </div>

        <div className="trophy">🏆</div>
      </div>

      <div className="stats">

        <Stat icon="👥" title="Teams" value={data.teams.length}/>
        <Stat icon="⚽" title="Matches" value={data.matches.length}/>
        <Stat icon="🔥" title="Completed" value={completed}/>
        <Stat
          icon="🥇"
          title="Current Leader"
          value={standings[0]?.name||"-"}
        />

      </div>

      <div className="dashboardGrid">

        <div className="card">
          <div className="cardHead">
            <div>
              <h2>Recent Matches</h2>
              <p>Latest tournament activity</p>
            </div>
            <button onClick={()=>location.hash="fixtures"}>
              View All
            </button>
          </div>

          {data.matches.slice(0,6).map(m=>
            <div className="matchRow" key={m.id}>
              <div className="club">
                <span>{m.home.charAt(0)}</span>
                <b>{m.home}</b>
              </div>

              <strong>{m.hs} - {m.as}</strong>

              <div className="club">
                <span>{m.away.charAt(0)}</span>
                <b>{m.away}</b>
              </div>

              <Status value={m.status}/>
            </div>
          )}
        </div>

        <div className="card leaderCard">
          <h2>🏆 Leaderboard</h2>
          <p>Top performing teams</p>

          {standings.slice(0,5).map((t,i)=>
            <div className="leader" key={t.id}>
              <b className={"rank r"+i}>{i+1}</b>
              <span>{t.name}</span>
              <strong>{t.pts} pts</strong>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

function Stat({icon,title,value}){
  return(
    <div className="statCard">
      <div className="statIcon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Status({value}){
  return(
    <span className={
      value==="Completed"?"badge green":
      value==="Live"?"badge red":"badge blue"
    }>
      {value}
    </span>
  );
}

function Fixtures({data,changeMatch,changeBracket}){

  if(data.tournament.format==="Single Elimination")
    return <Bracket data={data} changeBracket={changeBracket}/>;

  return(
    <section className="card">
      <div className="cardHead">
        <div>
          <h2>⚽ Match Fixtures</h2>
          <p>{data.matches.length} matches generated automatically</p>
        </div>
        <span className="badge purpleBadge">ROUND ROBIN</span>
      </div>

      {data.matches.map(m=>
        <div className="fixtureRow" key={m.id}>

          <div className="fixtureTeams">
            <b>{m.home}</b>
            <span>VS</span>
            <b>{m.away}</b>
          </div>

          <input
            type="date"
            value={m.date}
            onChange={e=>changeMatch(m.id,"date",e.target.value)}
          />

          <input
            type="time"
            value={m.time}
            onChange={e=>changeMatch(m.id,"time",e.target.value)}
          />

          <input
            placeholder="Venue"
            value={m.venue}
            onChange={e=>changeMatch(m.id,"venue",e.target.value)}
          />

          <Status value={m.status}/>

        </div>
      )}
    </section>
  );
}

function Bracket({data,changeBracket}){

  let q=data.bracket;

  return(
    <section>
      <div className="card bracketHeader">
        <h2>🏆 Single Elimination Bracket</h2>
        <p>Quarterfinals → Semifinals → Final</p>
      </div>

      <div className="bracket">

        <div className="round">
          <h3>Quarterfinals</h3>

          {q.map(m=>
            <BracketMatch
              key={m.id}
              m={m}
              change={changeBracket}
            />
          )}
        </div>

        <div className="round middle">
          <h3>Semifinals</h3>

          {[1,2].map(id=>
            <div className="bracketMatch empty" key={id}>
              <b>Winner QF {id*2-1}</b>
              <span>VS</span>
              <b>Winner QF {id*2}</b>
            </div>
          )}
        </div>

        <div className="round final">
          <h3>🏆 Final</h3>

          <div className="bracketMatch empty">
            <b>Winner SF 1</b>
            <span>VS</span>
            <b>Winner SF 2</b>
          </div>
        </div>

      </div>
    </section>
  );
}

function BracketMatch({m,change}){

  return(
    <div className="bracketMatch">

      <div>
        <b>{m.home}</b>
        <input
          type="number"
          min="0"
          value={m.hs}
          onChange={e=>change(m.id,"hs",e.target.value)}
        />
      </div>

      <div>
        <b>{m.away}</b>
        <input
          type="number"
          min="0"
          value={m.as}
          onChange={e=>change(m.id,"as",e.target.value)}
        />
      </div>

      <select
        value={m.status}
        onChange={e=>change(m.id,"status",e.target.value)}
      >
        <option>Upcoming</option>
        <option>Live</option>
        <option>Completed</option>
      </select>

    </div>
  );
}

function Scoring({data,changeMatch,changeBracket}){

  let matches=data.tournament.format==="Single Elimination"
    ?data.bracket:data.matches;

  return(
    <section className="card">
      <div className="cardHead">
        <div>
          <h2>🎯 Live Match Console</h2>
          <p>Update scores and match status</p>
        </div>
        <span className="badge red">LIVE</span>
      </div>

      {matches.map(m=>
        <div className="scoreRow" key={m.id}>

          <div className="scoreTeam">
            <span>{m.home.charAt(0)}</span>
            <b>{m.home}</b>
          </div>

          <input
            type="number"
            min="0"
            value={m.hs}
            onChange={e=>
              data.tournament.format==="Single Elimination"
              ?changeBracket(m.id,"hs",e.target.value)
              :changeMatch(m.id,"hs",e.target.value)
            }
          />

          <strong>:</strong>

          <input
            type="number"
            min="0"
            value={m.as}
            onChange={e=>
              data.tournament.format==="Single Elimination"
              ?changeBracket(m.id,"as",e.target.value)
              :changeMatch(m.id,"as",e.target.value)
            }
          />

          <div className="scoreTeam">
            <span>{m.away.charAt(0)}</span>
            <b>{m.away}</b>
          </div>

          <Status value={m.status}/>

        </div>
      )}
    </section>
  );
}

function Standings({standings}){

  return(
    <section className="card">

      <div className="cardHead">
        <div>
          <h2>📊 League Standings</h2>
          <p>Automatically calculated rankings</p>
        </div>

        <button onClick={()=>window.print()}>
          🖨 Print
        </button>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>POS</th>
              <th>TEAM</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>PTS</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((t,i)=>
              <tr key={t.id}>
                <td>
                  <span className={"position p"+i}>
                    {i+1}
                  </span>
                </td>

                <td>
                  <div className="tableTeam">
                    <span>{t.name.charAt(0)}</span>
                    <b>{t.name}</b>
                  </div>
                </td>

                <td>{t.mp}</td>
                <td>{t.w}</td>
                <td>{t.d}</td>
                <td>{t.l}</td>
                <td className={t.gd>=0?"positive":"negative"}>
                  {t.gd>0?"+":""}{t.gd}
                </td>
                <td><strong>{t.pts}</strong></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </section>
  );
}