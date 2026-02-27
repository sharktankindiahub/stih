import pandas as pd, json, math, sys
from pathlib import Path

def safe_float(v,d=None):
    try:
        if v is None or (isinstance(v,float) and math.isnan(v)): return d
        return float(v)
    except: return d
def safe_int(v,d=None):
    f=safe_float(v); return int(f) if f is not None else d
def safe_bool(v):
    f=safe_float(v); return bool(f) if f is not None else False
def safe_str(v,d=""):
    if v is None or (isinstance(v,float) and math.isnan(v)): return d
    s=str(v).strip(); return s if s and s.lower()!="nan" else d
def fmt(a):
    if a is None: return None
    return "Rs%.1fCr"%(a/100) if a>=100 else "Rs%dL"%int(a)

SHARKS=["Namita","Vineeta","Anupam","Aman","Peyush","Ritesh","Amit"]
META={"Namita":{"full":"Namita Thapar","title":"Executive Director, Emcure Pharma","emoji":"\U0001f48a","color":"#8B5CF6"},"Vineeta":{"full":"Vineeta Singh","title":"CEO & Co-founder, SUGAR Cosmetics","emoji":"\U0001f484","color":"#EC4899"},"Anupam":{"full":"Anupam Mittal","title":"Founder & CEO, Shaadi.com","emoji":"\U0001f48d","color":"#3B82F6"},"Aman":{"full":"Aman Gupta","title":"Co-founder & CMO, boAt","emoji":"\U0001f3a7","color":"#F97316"},"Peyush":{"full":"Peyush Bansal","title":"Co-founder & CEO, Lenskart","emoji":"\U0001f453","color":"#10B981"},"Ritesh":{"full":"Ritesh Agarwal","title":"Founder & CEO, OYO Rooms","emoji":"\U0001f3e8","color":"#F59E0B"},"Amit":{"full":"Amit Jain","title":"Co-founder & CEO, CarDekho","emoji":"\U0001f697","color":"#6366F1"},"Ashneer":{"full":"Ashneer Grover","title":"Co-founder, BharatPe","emoji":"\U0001f4b8","color":"#EF4444"}}
SY={1:"2021-22",2:"2023",3:"2024",4:"2025",5:"2026"}

df=pd.read_csv("src/data/raw/kaggle_raw_latest.csv")
print("Loaded %d rows"%len(df))

pitches=[]
for _,row in df.iterrows():
    n=safe_str(row.get("Startup Name"),"Pitch%d"%(len(pitches)+1))
    pid=n.lower().replace(" ","").replace("-","")
    aa=safe_float(row.get("Original Ask Amount")); ae=safe_float(row.get("Original Offered Equity"))
    vr=safe_float(row.get("Valuation Requested")); av=(vr/100) if vr else None
    fu=safe_bool(row.get("Accepted Offer")); ro=safe_bool(row.get("Received Offer"))
    da=safe_float(row.get("Total Deal Amount")); de=safe_float(row.get("Total Deal Equity"))
    dvr=safe_float(row.get("Deal Valuation")); dv=(dvr/100) if dvr else None
    td=safe_float(row.get("Total Deal Debt")); rp=safe_float(row.get("Royalty Percentage"))
    di=safe_float(row.get("Debt Interest")); hc=safe_bool(row.get("Deal Has Conditions"))
    delta=round(((dv-av)/av)*100,1) if dv and av and av>0 else None
    dt="royalty" if rp and rp>0 else ("mixed" if td and td>0 else "equity")
    bd={}; sl=[]
    for s in SHARKS:
        a=safe_float(row.get(s+" Investment Amount")); e=safe_float(row.get(s+" Investment Equity")); d=safe_float(row.get(s+" Debt Amount"))
        if a and a>0:
            bd[s]={"amt":a,"eq":e or 0}; sl.append(s)
            if d and d>0: bd[s]["debt"]=d
    gn_raw=safe_str(row.get("Invested Guest Name"))
    if gn_raw:
        gns=[n.strip() for n in gn_raw.split(',') if n.strip()]
        ga=safe_float(row.get("Guest Investment Amount")); ge=safe_float(row.get("Guest Investment Equity"))
        if ga and ga>0 and gns:
            split_a=round(ga/len(gns),2); split_e=round((ge or 0)/len(gns),2) if len(gns)>1 else (ge or 0)
            for gn in gns: sl.append(gn); bd[gn]={"amt":split_a,"eq":split_e}
    p={"id":pid,"name":n,"season":safe_int(row.get("Season Number"),1),"ep":safe_int(row.get("Episode Number")),"pitch":safe_int(row.get("Pitch Number")),"industry":safe_str(row.get("Industry")),"type":safe_str(row.get("Business Description")),"summary":safe_str(row.get("Business Description")),"city":safe_str(row.get("Pitchers City")),"state":safe_str(row.get("Pitchers State")),"website":safe_str(row.get("Company Website")),"startedIn":safe_str(row.get("Started in")),"funded":fu,"receivedOffer":ro,"dealType":dt,"ask":fmt(aa),"askAmt":aa,"askEq":ae,"askVal":round(av,2) if av else None,"deal":fmt(da) if fu and da else None,"dealAmt":da if fu else None,"dealEq":de if fu else None,"dealVal":round(dv,2) if fu and dv else None,"finalVal":round(dv,2) if fu and dv else None,"deltaVal":delta,"totalDebt":td if fu else None,"debtInterest":di if fu else None,"royaltyPct":rp if fu else None,"hasConditions":hc,"sharks":sl,"numSharks":safe_int(row.get("Number of Sharks in Deal"),0) if fu else 0,"sharkBreakdown":bd,"numPresenters":safe_int(row.get("Number of Presenters")),"malePresenters":safe_int(row.get("Male Presenters")),"femalePresenters":safe_int(row.get("Female Presenters")),"couplePresenters":safe_bool(row.get("Couple Presenters")),"pitchersAge":safe_str(row.get("Pitchers Average Age")),"revenue":safe_float(row.get("Yearly Revenue")),"margin":safe_float(row.get("Gross Margin")),"ebitda":safe_float(row.get("EBITDA")),"cashBurn":safe_str(row.get("Cash Burn")),"skus":safe_int(row.get("SKUs")),"hasPatents":safe_bool(row.get("Has Patents")),"bootstrapped":safe_str(row.get("Bootstrapped"))}
    pitches.append(p)
with open("src/data/pitches.json","w",encoding="utf-8") as f: json.dump(pitches,f,indent=2,ensure_ascii=False)
print("pitches.json: %d records. Sample: %s funded=%s deal=%s sharks=%s"%(len(pitches),pitches[0]["name"],pitches[0]["funded"],pitches[0]["deal"],pitches[0]["sharks"]))

ss={s:{"d":0,"i":0.0,"sn":set(),"ind":{}} for s in SHARKS}
for _,row in df.iterrows():
    if not safe_bool(row.get("Accepted Offer")): continue
    sn=safe_int(row.get("Season Number"),0); ind=safe_str(row.get("Industry"))
    for s in SHARKS:
        a=safe_float(row.get(s+" Investment Amount"))
        if a and a>0:
            ss[s]["d"]+=1; ss[s]["i"]+=a
            if sn: ss[s]["sn"].add(sn)
            if ind: ss[s]["ind"][ind]=ss[s]["ind"].get(ind,0)+1
sharks=[]
for i,s in enumerate(SHARKS):
    m=META[s]; st=ss[s]; ti=sorted(st["ind"].items(),key=lambda x:-x[1])
    sharks.append({"id":i+1,"name":s,"fullName":m["full"],"title":m["title"],"emoji":m["emoji"],"color":m["color"],"deals":st["d"],"investedCr":round(st["i"]/100,1),"topIndustries":[x[0] for x in ti[:3]],"seasons":sorted(st["sn"])})
ad=0; ai=0.0
for _,row in df.iterrows():
    if "Ashneer" in safe_str(row.get("Invested Guest Name")):
        a=safe_float(row.get("Guest Investment Amount"))
        if a and a>0: ad+=1; ai+=a
m=META["Ashneer"]; sharks.append({"id":9,"name":"Ashneer","fullName":m["full"],"title":m["title"],"emoji":m["emoji"],"color":m["color"],"deals":ad,"investedCr":round(ai/100,1),"topIndustries":[],"seasons":[1,2]})
with open("src/data/sharks.json","w",encoding="utf-8") as f: json.dump(sharks,f,indent=2,ensure_ascii=False)
print("sharks.json: %d records"%len(sharks))

seasons=[]
for num in range(1,6):
    sd=df[df["Season Number"]==num]; t=len(sd); fu=int(sd["Accepted Offer"].apply(safe_bool).sum())
    inv=sd["Total Deal Amount"].apply(lambda v:safe_float(v,0)).sum(); ep=int(sd["Episode Number"].max()) if t>0 else 0
    seasons.append({"id":num,"number":num,"name":"Season %d"%num,"year":SY.get(num,str(num)),"startDate":safe_str(sd["Season Start"].iloc[0]) if t>0 else "","endDate":safe_str(sd["Season End"].iloc[0]) if t>0 else "","totalPitches":t,"dealsClosedCount":fu,"dealRate":round(fu/t*100) if t>0 else 0,"investedCr":round(inv/100,1),"episodes":ep})
with open("src/data/seasons.json","w",encoding="utf-8") as f: json.dump(seasons,f,indent=2,ensure_ascii=False)
print("seasons.json: %d records"%len(seasons))

industries=[]
for ind,g in df.groupby("Industry"):
    t=len(g); fu=int(g["Accepted Offer"].apply(safe_bool).sum()); inv=g["Total Deal Amount"].apply(lambda v:safe_float(v,0)).sum()
    industries.append({"name":str(ind),"total":t,"funded":fu,"dealRate":round(fu/t*100) if t>0 else 0,"investedCr":round(inv/100,1)})
industries.sort(key=lambda x:-x["total"])
with open("src/data/industries.json","w",encoding="utf-8") as f: json.dump(industries,f,indent=2,ensure_ascii=False)
print("industries.json: %d records"%len(industries))
print("ALL DONE")
