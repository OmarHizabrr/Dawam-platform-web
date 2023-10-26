<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\MemberAPIController;
use App\Http\Controllers\API\SpeakerAPIController;
use App\Http\Controllers\API\EventAPIController;
use  App\Http\Controllers\API\CommitteeAPIController;
use App\Http\Controllers\API\PostAPIController;
use App\Http\Controllers\API\CategoryAPIController;
use App\Http\Controllers\API\VacationAPIController;
use App\Http\Controllers\API\AttendanceLogAPIController;
use App\Http\Controllers\API\UserAPIController;
use App\User;
use App\Models\Category;
use App\Models\AttendanceLog;
use App\Vacation;
use App\Attendancerecord;
use App\Debt;
use App\Alert;
use App\Device;
use App\Phone;
use App\Qualification;
use App\Prework;
use App\Attachment;
use App\Duration;
use App\Durationtype;
use App\Type;
use App\Setting;
use App\Allownce;

use Carbon\Carbon;
/*-------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('members/requests ','MemberAPIController@getRequests');

Route::get('members/requests ','MemberAPIController@getRequests');
Route::resource('members', 'MemberAPIController');
Route::resource('events','EventAPIController');

Route::resource('categories', 'CategoryAPIController');

Route::resource('attendancelogs', 'AttendanceLogAPIController');

Route::get('/log-test/{user_id}/{start?}/{end?}', 'AttendanceLogAPIController@index');
Route::post('users/login ','UserAPIController@login');
Route::post('users/add ','UserAPIController@addUser');
Route::delete('users/remove/{id} ','UserAPIController@remove');

Route::delete('departments/remove/{id} ',function($id){
    $cat=Category::find($id);
    $cat->delete();
});

Route::post('categories/add ','CategoryAPIController@addCategory');

Route::post('update-profile',function(Request $request){
    $user=User::find($request->input('user_id'));
    
   $path = $request -> file('image') -> store('users','public');
    $user->avatar= $path;
    $user->save();
    return $user->avatar;
    
});
Route::get('/attendancelog-old/{user_id}/{start?}/{end?}', function ($user_id,$start="",$end="") {
    
  $logs=DB::select("select date,dayName,attendance_time,leave_time,workHours,vacHours,lateTime,discount,(SELECT name from vacationstypes where vacationstypes.id= types) as types,bonusTime,calattendancerecords.notes from calattendancerecords where user_id=? and date BETWEEN ? and ? union 
                    SELECT date,(select ar_day from daynames where daynames.en_day = dayname(date) limit 1),'','',0,'','',if(type=1 and (SELECT status from users where user_id=? limit 1)=16,0, getDialySalary(?)),'','','' from dates where date BETWEEN ? and ?  and date not in (SELECT date from calattendancerecords where user_id=? and date BETWEEN ? and ? ) ORDER BY date DESC",[$user_id,$start,$end,$user_id,$user_id,$start,$end,$user_id,$start,$end]); 
   
  return $logs;
});

Route::get('/attendancelog/{user_id}/{start?}/{end?}', function ($user_id,$start="",$end="") {
    
  $logs=DB::select("select date,dayName,attendance_time,leave_time,workHours,vacHours,(Select count(*) from vacations where vacations.user_id=? and date between Date(vacations.date_from) and Date(vacations.date_to) limit 1) as have_vac,lateTime,discount,(SELECT name from vacationstypes where vacationstypes.id= types) as types,bonusTime,calattendancerecords.notes from calattendancerecords where user_id=? and date BETWEEN ? and ? union 
                    SELECT date,(select ar_day from daynames where daynames.en_day = dayname(date) limit 1),'','',0,'',0,'',if(type=1 and (SELECT status from users where user_id=? limit 1)=16,0, getDialySalary(?)),'','','' from dates where date BETWEEN ? and ?  and date not in (SELECT date from calattendancerecords where user_id=? and date BETWEEN ? and ? ) ORDER BY date DESC",[$user_id,$user_id,$start,$end,$user_id,$user_id,$start,$end,$user_id,$start,$end]); 
   
  return $logs;
});

Route::get('/bonuslog/{user_id}/{start?}/{end?}', function ($user_id,$start="",$end="") {
    
  $logs=DB::select("SELECT *,(select ar_day from daynames where daynames.en_day = dayname(date) limit 1) as dayName FROM `calattendancerecords` where time_to_sec(bonusTime) >= 30*60 and date BETWEEN ? and ? and user_id=?;",[$start,$end,$user_id]); 
  return $logs;
});


Route::get('/attendancelogs/{user_id}/{date}', function ($user_id,$date) {
  $logs=DB::select("select att.*,vacationstypes.name from (Select * from calattendancelogs where user_id=? and date=?) as att left join vacationstypes on att.type=vacationstypes.id",[$user_id,$date]); 
  return $logs;
});
Route::get('/attendancelogs-between/{user_id}/{date_from}/{date_to}', function ($user_id,$date_from,$date_to) {
  $logs=DB::select("select att.*,vacationstypes.name from (Select * from calattendancelogs where user_id=? and date between ? and ?) as att left join vacationstypes on att.type=vacationstypes.id",[$user_id,explode(' ',$date_from)[0],explode(' ',$date_to)[0]]); 
  return $logs;
});

Route::get('/durations', function () {
  $durations=DB::select("select durations.*,durationtypes.name as durationtype  from durations join durationtypes on durations.durationtype_id=durationtypes.id"); 
  return $durations;
});

Route::get('/get-types/{type}', function ($type) {
  if($type=='tasks'){
    $types=DB::select("select * from vacationstypes"); 
  }
  return $types;
});

Route::get('/durationtypes', function () {
  $durations=DB::select("select name as label,id as value from durationtypes"); 
  return $durations;
});

Route::delete('/duration/{id}', function ($id) {
   $dur=Duration::find($id); 
   $dur->delete();
});

Route::post('/durations', function (Request $request) {
    date_default_timezone_set("Asia/Aden");
 
   $dur=Duration::find($request->input('id'));
   
    if(!$dur) $dur=new Duration;
    
   $dur->title=$request->input('title');
   $dur->startDate=$request->input('startDate');
   $dur->endDate=$request->input('endDate');
    $dur->startTime=$request->input('startTime');
   $dur->endTime=$request->input('endTime');
    $dur->allowedStartTime=$request->input('allowedStartTime');
   $dur->allowedEndTime=$request->input('allowedEndTime');
   $dur->durationtype_id=$request->input('durationtype_id');
   
   $dur->save();
   return $dur;
});

Route::get('/all-users-log/{day}', function ($day) {
    $logs=DB::select("select users.name as fullname,user_name,job,attendance_time,leave_time,workHours,categories.name as department,avatar,users.user_id as user_id from calattendancerecords join users on users.user_id = calattendancerecords.user_id and calattendancerecords.attendance_time is not NULL join categories on categories.id = users.category_id and date=?  ORDER BY STR_TO_DATE(attendance_time,'%h:%i:%s %p') ASC",[$day]);
    $end = date('Y-m-d', strtotime('today - 1 day')); // set the end date to yesterday
    $start = date('Y-m-d', strtotime($end . ' - 30 days')); // set the start date to 30 days before yesterday

    $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
    $lists=DB::select("Select users.user_id,users.name,users.job,categories.name as category,users.salary, r.lateTimePrice ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users join categories on users.category_id=categories.id join (SELECT floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)*getMinutePrice(user_id,date))) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
        ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id order by category",[$start,$end,$start,$end,$start,$end,$start,$end]);
    
    $users_count=User::where('fingerprint_type','22')->count();
    $late_count=DB::select("select sum(case when time_to_sec(timediff(getDurationStart(date,user_id),attendance_time))/60 < 0 then 1 else 0 end ) as lateCount from calattendancerecords where calattendancerecords.attendance_time is not NULL and date=?",[$day]);
    $ablogs=DB::select("SELECT u.user_id, u.name as fullname,u.job,categories.name as department FROM users u join categories on u.category_id=categories.id LEFT JOIN (SELECT * from calattendancerecords where date=?) a ON u.user_id = a.user_id WHERE a.user_id IS NULL and u.fingerprint_type != '21' and u.status in ('16','17') order by u.name;",[$day]); 
    $latelogs=DB::select("SELECT u.user_id, u.name as fullname,u.job,categories.name as department FROM users u join categories on u.category_id=categories.id LEFT JOIN (SELECT * from calattendancerecords where date=? and discount = 0) a ON u.user_id = a.user_id WHERE a.user_id IS NULL and u.fingerprint_type != '21' and u.status in ('16','17') order by u.name",[$day]); 

    return compact('logs','lists','count','users_count','late_count','ablogs','latelogs');
});

Route::get('/all-absents-log/{day}', function ($day) {
    
  $logs=DB::select("SELECT u.user_id, u.name as fullname,u.job,categories.name as department FROM users u join categories on u.category_id=categories.id LEFT JOIN (SELECT * from attendancelogs where date='2023-07-13') a ON u.user_id = a.user_id WHERE a.user_id IS NULL and u.fingerprint_type != '21' order by u.name;"); 
  return $logs;
});

Route::get('/general-statistics',function(){
   $users_count=User::all()->count();
   $latest_assignment=DB::select('select assignment_date from users order by assignment_date desc limit 1');//User::orderBy('assignment_date')->take(1)->get()->value('assignment_date');
   $depts_count=Category::whereNull('parent_id')->count();
   $dept_emp_avg=round($users_count/$depts_count,0);

   $age_avg=User::avg('age');
   $youngest=User::latest('birth_date')->value('user_name'); 
   $attendance_count=AttendanceLog::where('date',date('Y-m-d'))->count();
   $attendance_percent=round(($attendance_count/$users_count)*100,2);
   $qulaifications=User::groupBy('qualification')->selectRaw('count(*) as count,qualification')->get();
   $depts_per=User::groupBy('category_id')->selectRaw('category_id,categories.name as category,count(*) as count')->join('categories','category_id', '=', 'categories.id')->get();
   
   $workHours=DB::select("SELECT (SUM(time_to_sec(workHours))) as workHours from calattendancerecords WHERE date BETWEEN '2022-07-09' and '2022-08-08'",[]);
   $idealTime=DB::select("SELECT (SUM(time_to_sec(getDuration(dates.date,users.user_id)))) as ideal_time  from users  join dates on users.user_id is not null and dates.type is null and dates.date BETWEEN '2022-07-09' and '2022-08-08'",[]);
  return(compact('users_count','latest_assignment','depts_count','dept_emp_avg','age_avg','youngest','attendance_count','attendance_percent','qulaifications','depts_per','workHours','idealTime'));

});
Route::post('/eventslog',function(Request $request){
    $arr=$request->all();
   
  for($i=1;$i<=count($arr);$i++){
     $obj=json_decode($arr["".$i.""]);
    
    try{
     DB::table('events')
     ->updateOrInsert(
         ['user_id' =>$obj->user_id ,
         'events_datetime' => date('Y-m-d H:i:s',strtotime(str_replace('/','-',$obj->events_datetime))),
         //   'events_datetime' => $obj->events_datetime,
         'created_at'=>date("Y-m-d H:i:s"),
         'updated_at'=>date("Y-m-d H:i:s")
         ]
         );
        }
        catch(Exception $e){
         echo 'Caught exception: ',  $e->getMessage(), "\n";
        }
        
    }
  

});
Route::post('/events-import',function(Request $request){
    $arr=$request->all();
   // print_r($arr);
  for($i=0;$i<count($arr);$i++){
     //$obj=json_decode($arr["".$i.""]);
    // echo $arr["".$i.""]['events_datetime'];
     try{
     DB::table('events')
     ->updateOrInsert(
         ['user_id' =>$arr["".$i.""]['user_id'] ,
         'events_datetime' => date('Y-m-d H:i:s',strtotime(str_replace('/','-',$arr["".$i.""]['events_datetime']))),
         'created_at'=>date("Y-m-d H:i:s"),
         'updated_at'=>date("Y-m-d H:i:s")
         ]
         );
        }
        catch(Exception $e){
         echo 'Caught exception: ',  $e->getMessage(), "\n";
        }
        
    }

});

Route::get('/discounts-list/{start}/{end}', function ($start,$end){
    
    $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);

    
    $lists=DB::select("Select users.user_id,users.fingerprint_type,users.name,users.job,categories.name as category,users.salary,r.lateTime,r.lateTimePrice,r.attendanceDays from users left join categories on users.category_id=categories.id left join (SELECT time_format(sec_to_time(ifnull(floor(sum(time_to_sec(lateTime))),0)),'%H:%i') as lateTime, ifnull(floor(sum((time_to_sec((lateTime))/60)))*getMinutePrice(user_id,date),0) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id where users.status='16' order by users.level,users.salary desc",[$start,$end]);
    $categories=Category::whereNull('parent_id')->orderBy('order')->get();
    
    return compact('lists','count','categories');
     
    });
    
Route::get('/wages-list/{start}/{end}', function ($start,$end){
        
        $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
        $count17=DB::select("select count(date) as count from dates where date between ? and ?", [$start,$end]);
            
        $lists=DB::select("Select users.user_id,users.name,ifnull((SELECT sum(allownce_amount) as allownces FROM `allownces` WHERE allownces.user_id=users.user_id limit 1),0) as allownces,users.fingerprint_type,users.job,categories.name as category,users.salary,users.status, ifnull(r.lateTimePrice,0) as lateTimePrice ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users left join categories on users.category_id=categories.id left join (SELECT floor(sum((time_to_sec((lateTime))/60)))*getMinutePrice(user_id,date) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
        ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id and users.status in ('16','17') left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id where users.status in ('16','17') order by users.level,users.salary desc",[$start,$end,$start,$end,$start,$end,$start,$end]);
        
        $categories=Category::whereNull('parent_id')->orderBy('order')->get();
        
        return compact('lists','count','categories','count17');
       });
Route::get('get-att-days-count/{start}/{end}',function($start,$end){
    $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
    return $count;
});

Route::get('transport-amounts/{user_id}/{start}/{end}',function($user_id,$start,$end){
     //$reocrds=Attendancerecord::where('user_id',$user_id)->whereBetween('date',[$start,$end])->get();
     $reocrds=DB::select("SELECT calattendancerecords.dayName,calattendancerecords.date,users.transfer_value FROM calattendancerecords join users ON calattendancerecords.user_id=users.user_id and calattendancerecords.attendance_time is not null and calattendancerecords.user_id=? and date BETWEEN ? and ? ORDER BY calattendancerecords.date DESC", [$user_id,$start,$end]);
     return $reocrds;
});

Route::get('transport-cumulative/{start}/{end}',function($start,$end){
    $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
    $records=DB::select("SELECT users.user_id,users.name,users.job,categories.name as category,count(users.transfer_value) as transportCount,users.transfer_value as transfer_value,sum(users.transfer_value) as transportAmount FROM `calattendancerecords` join users ON calattendancerecords.user_id=users.user_id and users.status='16' and calattendancerecords.attendance_time is not NULL and date BETWEEN ? and ? JOIN categories on users.category_id=categories.id GROUP BY user_id order by users.level,users.salary desc", [$start,$end]);
    $categories=Category::whereNull('parent_id')->orderBy('order')->get();
        
    return compact('records','categories','count');
});

Route::get('dawam-info/{user_id}/{start}/{end}',function($user_id,$start,$end){
     $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
     $data=DB::select("SELECT u.salary as salary,u.user_id,ifnull(floor(sum(time_to_sec(Time_Format(r.lateTime,'%H:%i'))/60)),0) as lateTime, ifnull(floor(sum((time_to_sec(Time_Format(r.lateTime,'%H:%i'))/60)*getMinutePrice(r.user_id,r.date))),0) as lateTimePrice,count(r.date) as attendanceDays,getDialySalary(r.user_id) as dsalary from calattendancerecords r join users u on r.user_id=u.user_id and date BETWEEN ? and ? and u.user_id=?", [$start,$end,$user_id]);
     $vacs=DB::select('SELECT vacationstypes.id,ifnull(time_format(sec_to_time(sum(time_to_sec(workHour))),"%H:%i"),0) as cumHours from calattendancelogs right join vacationstypes on type=vacationstypes.id  and  user_id=? and date BETWEEN ? and ? GROUP BY type,user_id', [$user_id,$start,$end]);
     $vacstypes=DB::select('select * from vacationstypes where att_report = 1 order by days desc');
     $totalvacs=DB::select("SELECT uid,salary,vid,round(sec_to_time((amount*60)-time_to_sec(vac_duration))) as rest FROM (SELECT `vacationstype_id`,SUM(`amount`) as amount,user_id FROM `vacations_users` GROUP BY user_id, `vacationstype_id`) vs JOIN cumvacations on cumvacations.uid=vs.user_id and cumvacations.vid=vs.vacationstype_id and uid=?", [$user_id]);
     $debt=DB::select("SELECT ifnull(sum(amount),0) as amount from debts where user_id=? and debt_date between ? and ?", [$user_id,$start,$end]);   
     $long_debt=DB::select("SELECT ifnull(sum(if(owner=1,amount,0)),0) as amount from accounts  where user_id=? and debt_date between ? and ?", [$user_id,$start,$end]);      
    
    $lists=DB::select("Select users.user_id,users.name,users.job,categories.name as category,users.salary, r.lateTimePrice ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users join categories on users.category_id=categories.id join (SELECT floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)*getMinutePrice(user_id,date))) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
        ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id where users.user_id=? order by category",[$start,$end,$start,$end,$start,$end,$start,$end,$user_id]);
    $lists=count($lists)>0?$lists[0]:$lists;
    $year=date("Y", strtotime($end));
    $start=($year-1)."-12-23";
    $end=$year."-12-22";
    
    $tasksAmount=DB::select('SELECT vacacc.*,vacacc.user_id uid,categories.name as category,ifnull(vaccons.vac_cons_m,0) as vac_cons_m,ifnull(vacacc.amount_m,0)-ifnull(vaccons.vac_cons_m,0) as rest FROM (Select users.name as fullname,users.job,users.category_id,vac_acc.* From (SELECT user_id,vacationstype_id as vid,SUM(`amount`) as amount_m FROM vacations_users where vacations_users.created_at BETWEEN ? and ? GROUP BY vacations_users.user_id,vacations_users.vacationstype_id) vac_acc right JOIN users on vac_acc.user_id=users.user_id) vacacc LEFT JOIN (SELECT user_id,type as vac_id,sum(time_to_sec(timediff(`attendancelogs`.`leave_time`,`attendancelogs`.`attendance_time`))/60) as vac_cons_m FROM attendancelogs WHERE date BETWEEN ? and ? and type>0 GROUP BY attendancelogs.user_id,attendancelogs.type) vaccons on vaccons.user_id=vacacc.user_id and vaccons.vac_id=vacacc.vid JOIN categories on vacacc.category_id=categories.id WHERE vacacc.user_id=?',[$start,$end,$start,$end,$user_id]);
 
     return compact('count','data','vacs','vacstypes','totalvacs','debt','long_debt','tasksAmount','lists');
});

Route::get('salary-info/{user_id}/{start}/{end}',function($user_id,$start,$end){
         $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
         $att_count=DB::select("SELECT count(*) as count,SUM(case when TIME_FORMAT(STR_TO_DATE(`attendance_time`, '%h:%i:%s %p'), '%T')  <= getDurationStart(`date`,`user_id`) then 1 else 0 end) as att_count  FROM `calattendancerecords` WHERE `user_id` = ? AND `date` BETWEEN ? AND ?  and attendance_time is not null", [$user_id,$start,$end]);
         $leave_count=DB::select("select count(*) as count,SUM(case when TIME_FORMAT(STR_TO_DATE(leave_time, '%h:%i:%s %p'), '%T') >= getDurationEnd(`date`,`user_id`) then 1 else 0 end) as leave_count from calattendancerecords WHERE user_id=? and date BETWEEN ? and ? and  leave_time is not NULL", [$user_id,$start,$end]);
         $id_count=DB::select("select count(*) as count,SUM(case when discount=0 then 1 else 0 end) as id_count from calattendancerecords WHERE user_id=? and date BETWEEN ? and ? and  (leave_time is not NULL or attendance_time is not NULL)", [$user_id,$start,$end]);
         $vac_count=DB::select("SELECT SUM(case when datediff(created_at,date_to)<=3 then 1 else 0 end) as late_vacs,count(*) as count FROM `vacations` where user_id=? and date_to BETWEEN ? and ?", [$user_id,$start,$end]);

         $lists=DB::select("Select users.user_id,users.name,users.job,users.salary, r.lateTimePrice ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users join (SELECT floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)*getMinutePrice(user_id,date))) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id and users.status='16' and users.user_id=? left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
        ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id",[$start,$end,$user_id,$start,$end,$start,$end,$start,$end]);
         $start=date('Y-m-d', strtotime('today - 30 days'));
         $end=date('Y-m-d');
         $logs=DB::select("select date,getDuration(date,user_id) as duartion,dayName,attendance_time,leave_time,workHours,vacHours,lateTime,discount,(SELECT name from vacationstypes where vacationstypes.id= types) as types,bonusTime,calattendancerecords.notes from calattendancerecords where user_id=? and date BETWEEN ? and ? union SELECT date,getDuration(date,?) as duartion,(select ar_day from daynames where daynames.en_day = dayname(date) limit 1),'','',0,'','',if(type=1,0, getDialySalary(?)),'','','' from dates where date BETWEEN ? and ?  and date not in (SELECT date from calattendancerecords where user_id=? and date BETWEEN ? and ? ) ORDER BY date DESC",[$user_id,$start,$end,$user_id,$user_id,$start,$end,$user_id,$start,$end]); 

        return compact('lists','count','logs','att_count','leave_count','id_count','vac_count');
});

Route::get('user-info/{user_id}/{start}/{end}',function($user_id,$start,$end){
         $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
         $att_count=DB::select("SELECT count(*) as count,SUM(case when TIME_FORMAT(STR_TO_DATE(`attendance_time`, '%h:%i:%s %p'), '%T')  <= getDurationStart(`date`,`user_id`) then 1 else 0 end) as att_count  FROM `calattendancerecords` WHERE `user_id` = ? AND `date` BETWEEN ? AND ?  and attendance_time is not null", [$user_id,$start,$end]);
         $leave_count=DB::select("select count(*) as count,SUM(case when TIME_FORMAT(STR_TO_DATE(leave_time, '%h:%i:%s %p'), '%T') >= getDurationEnd(`date`,`user_id`) then 1 else 0 end) as leave_count from calattendancerecords WHERE user_id=? and date BETWEEN ? and ? and  leave_time is not NULL", [$user_id,$start,$end]);
         $id_count=DB::select("select count(*) as count,SUM(case when discount=0 then 1 else 0 end) as id_count from calattendancerecords WHERE user_id=? and date BETWEEN ? and ? and  (leave_time is not NULL or attendance_time is not NULL)", [$user_id,$start,$end]);
         $vac_count=DB::select("SELECT SUM(case when datediff(created_at,date_to)<=3 then 1 else 0 end) as late_vacs,count(*) as count FROM `vacations` where user_id=? and date_to BETWEEN ? and ?", [$user_id,$start,$end]);
         
         $lists=DB::select("Select users.user_id,users.name,users.job,users.salary, r.lateTimePrice, r.lateTime,r.bonusTime ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users join (SELECT floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)*getMinutePrice(user_id,date))) as lateTimePrice,(floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)))) as lateTime,floor(sum((time_to_sec(Time_Format(bonusTime,'%H:%i'))/60))) as bonusTime,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id and users.user_id=? left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
            ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id",[$start,$end,$user_id,$start,$end,$start,$end,$start,$end]);

         $logs=DB::select("select date,getDuration(date,user_id) as duartion,dayName,attendance_time,leave_time,workHours,vacHours,lateTime,discount,(SELECT name from vacationstypes where vacationstypes.id= types) as types,bonusTime,calattendancerecords.notes from calattendancerecords where user_id=? and date BETWEEN ? and ? union SELECT date,getDuration(date,?) as duartion,(select ar_day from daynames where daynames.en_day = dayname(date) limit 1),'','',0,'','',if(type=1,0, getDialySalary(?)),'','','' from dates where date BETWEEN ? and ?  and date not in (SELECT date from calattendancerecords where user_id=? and date BETWEEN ? and ? ) ORDER BY date DESC",[$user_id,$start,$end,$user_id,$user_id,$start,$end,$user_id,$start,$end]); 
         $violations=DB::select('SELECT vio_name,ifnull(vio.vio_count,0) as vio_count FROM violationtypes left JOIN (SELECT user_id,violationtype_id,count(*) as vio_count From violations where user_id=? and violations.status!="0" and violations.vio_date BETWEEN ? and ? GROUP BY user_id,violations.violationtype_id) vio on vio.violationtype_id=violationtypes.id', [$user_id,$start,$end]);
         $vacs=DB::select('SELECT vacationstypes.id,ifnull(time_format(sec_to_time(sum(time_to_sec(workHour))),"%H:%i"),0) as cumHours from calattendancelogs right join vacationstypes on type=vacationstypes.id  and  user_id=? and date BETWEEN ? and ? GROUP BY type,user_id', [$user_id,$start,$end]);
         $vacstypes=DB::select('select id,name from vacationstypes where att_report = 1 order by days desc');
     
        return compact('lists','count','logs','violations','vacs','vacstypes','att_count','leave_count','id_count','vac_count');
});

Route::get('get-alerts/{user_id}',function($user_id){
   $alerts=Alert::with('users')->where('user_id',$user_id);
   return $alerts;
});
//---------------------Vacations------------------------------------------------

Route::post('/add-task','VacationAPIController@add_task');
Route::post('/add-accepted-tasks','VacationAPIController@add_accepted_tasks');
Route::post('/add-balance-tasks','VacationAPIController@add_balance_tasks');

Route::post('/accept-task','VacationAPIController@accept_task');
Route::post('/all-tasks','VacationAPIController@add_all_tasks');
Route::get('/get-tasks-types','VacationAPIController@getTasksType');
Route::get('/get-tasks-types-re','VacationAPIController@getTasksTypeRe');
Route::delete('/delete-task/{id}', 'VacationAPIController@deleteTask');
Route::post('/update-task', 'VacationAPIController@updateTask');
Route::get('/get-tasks-amount/{user_id}','VacationAPIController@getTasksAmount');
Route::get('/get-tasks/{id}/{start}/{end}','VacationAPIController@getTasks');
Route::get('/get-all-tasks/','VacationAPIController@getAllTasks');
Route::get('/get-tasks-requests/{id}/{start}/{end}','VacationAPIController@getTasksRequests');
Route::get('/get-all-accepted-tasks/{start}/{end}','VacationAPIController@getAllAcceptedTasks');
Route::get('/get-cum-tasks/{start}/{end}','VacationAPIController@getCumTasks');
Route::get('/get-rest-tasks/{year}','VacationAPIController@getRestTasks');

Route::get('/get-tasks-statment/{user_id}','VacationAPIController@getTaskStatment');

Route::get('/get-cum-user-tasks/{user_id}/{start}/{end}','VacationAPIController@getCumUserTasks');

Route::get('/get-annualy-tasks-report/{vac_id}/{year}','VacationAPIController@getAnnualyReport');

//-------------------------Debts---------------------------------------------
Route::get('/get-monthly-debts/{date_from}/{date_to}', function ($date_from,$date_to) {
    $debts = DB::table('debts')
    ->select('debts.id as id','debts.debt_date as debt_date','amount','type','users.name as name','users.salary as salary','users.job as job','users.avatar as avatar','categories.name as category')
    ->join('users', 'users.user_id', '=', 'debts.user_id')
    ->join('categories', 'categories.id', '=', 'users.category_id')
    ->where('type','=','نصف شهرية')
    ->where('users.is_hidden','<>','1')
    ->whereNotNull('users.user_id')
    ->whereBetween('debt_date', [$date_from, $date_to])
    ->orderBy('users.level')
    ->orderBy('users.salary','desc')
    ->get();
    
    $categories=Category::whereNull('parent_id')->orderBy('order')->get();
        
    return compact('debts','categories');

 });

Route::post('/pay-debt','DebtsAPIController@payDebt');
Route::get('/get-long-debts/{start}/{end}', 'DebtsAPIController@calcLongDebts');
Route::get('/update-debts-amount/{id}/{newValue}', 'DebtsAPIController@updateAmount');
Route::get('/delete-debt/{id}', 'DebtsAPIController@deleteDebt');
Route::delete('/delete-long-debt/{id}', 'DebtsAPIController@deleteLongDebt');

Route::get('/get-users-debts', 'DebtsAPIController@getUsersDebts');
Route::get('/get-users-long-debts', 'DebtsAPIController@getUsersLongDebts');
Route::post('/add-long-debt','DebtsAPIController@addLongDebt');
Route::post('/update-long-debt','DebtsAPIController@updateLongDebt');

Route::post('/add-all-debts','DebtsAPIController@addDebts');
Route::post('/add-all-long-debts','DebtsAPIController@addShortDebts');
//---------------------Violations------------------------------------------------
Route::get('/get-violations-types','ViolationsAPIController@getViolationsTypes');
Route::delete('/delete-violation/{vio_id}','ViolationsAPIController@deleteViolation');

Route::post('/add-violations','ViolationsAPIController@add_violations');

Route::post('/add-alert',function(Request $request){
    $users=$request->input('users');
    $text=$request->input('text');
   foreach($users as $user){
    $nt=new Alert;
    $nt->text=$text;
    $nt->all=0;
    $user=str_replace('"','',$user);
    $nt->user_id=$user;
    $nt->status=0;
    $nt->save(); 
    //print_r($nt);
   }
});

Route::get('/get-all-violations/{start}/{end}','ViolationsAPIController@getAllViolations');
Route::get('/get-cum-violations/{start}/{end}','ViolationsAPIController@getCumViolations');

//----------------------------Users------------------------------------------------
Route::post('/password-change',function(Request $request){
    $arr=$request->all();
    $user=User::find($request->input('user_id'));
    $user->password=bcrypt($request->input('password'));
    $user->save();
});

//---------------------------------Ranking Report---------------------
Route::get('/users-performance-rank/{start}/{end}',function ($start,$end){
    $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
   // $att_count=DB::select("SELECT count(*) as count,user_id,SUM(case when TIME_FORMAT(STR_TO_DATE(`attendance_time`, '%h:%i:%s %p'), '%T') <= getDurationStart(`date`,`user_id`) then 1 else 0 end) as att_count FROM `calattendancerecords` where `date` BETWEEN ? AND ? and attendance_time is not null GROUP BY user_id", [$start,$end]);
   // $leave_count=DB::select("select user_id,count(*) as count,SUM(case when TIME_FORMAT(STR_TO_DATE(leave_time, '%h:%i:%s %p'), '%T') >= getDurationEnd(`date`,`user_id`) then 1 else 0 end) as leave_count from calattendancerecords WHERE date BETWEEN ? AND ? and leave_time is not NULL GROUP BY user_id", [$start,$end]);
    
    $lists=DB::select("Select r.*,if(r.attendanceDays>?,1,round(r.attendanceDays/?,4)) as attendance_rate,(round(att.att_count/att.att_actual,4)) as att_rate,(round(leav.leave_count/leav.leave_actual,4)) as leave_rate,users.name as name,users.*,(SELECT  CONCAT(MAX(attendancelogs.leave_time), ',', MAX(attendancelogs.attendance_time)) as last_occ  FROM attendancelogs where attendancelogs.type=0 and attendancelogs.user_id=users.user_id) as last_occ ,categories.name as category from(SELECT user_id,count(*) as attendanceDays,SUM(time_to_sec(workHours)) as workHours,SUM(time_to_sec(lateTime)) as lateTimes,SUM(time_to_sec(bonusTime)) as bonusTime from calattendancerecords WHERE date BETWEEN ? and ? group by user_id) r join (SELECT count(*) as att_actual,user_id,SUM(case when TIME_FORMAT(STR_TO_DATE(`attendance_time`, '%h:%i:%s %p'), '%T') <= getDurationStart(`date`,`user_id`) then 1 else 0 end) as att_count FROM `calattendancerecords` where `date` BETWEEN ? and ? and attendance_time is not null GROUP BY user_id) att on r.user_id=att.user_id join (select user_id,count(*) as leave_actual,SUM(case when TIME_FORMAT(STR_TO_DATE(leave_time, '%h:%i:%s %p'), '%T') >= getDurationEnd(`date`,`user_id`) then 1 else 0 end) as leave_count from calattendancerecords WHERE date BETWEEN ? and ? and leave_time is not NULL GROUP BY user_id) as leav on r.user_id=leav.user_id right join users on r.user_id=users.user_id and users.is_hidden = 0 JOIN categories on users.category_id=categories.id ORDER BY (((attendance_rate*100)+((att_rate*100)*attendance_rate)+((leave_rate*100)*attendance_rate))/3) DESC",[$count[0]->count,$count[0]->count,$start,$end,$start,$end,$start,$end]);

    return $lists;

});

//---------------------------------------------------------------------
Route::get('/get-emp-names',function (){
    $names=User::select('user_id as value','name as label','category_id as category')->where('name','<>','Admin')->orderBy('level')->orderBy('salary','desc')->get();
    return $names;
});

Route::get('/get-cat-names',function (){
    $names=Category::select('id as value','name as label')->orderBy('name')->get();
    return $names;
});

Route::get('given-tasks/{user_id}/{start}/{end}',function($user_id,$start,$end){
    
    $vacs=DB::select('SELECT vacationstypes.id,ifnull(time_format(sec_to_time(sum(time_to_sec(workHour))),"%H:%i"),0) as cumHours from calattendancelogs right join vacationstypes on type=vacationstypes.id  and  user_id=? and date BETWEEN ? and ? GROUP BY type,user_id', [$user_id,$start,$end]);
    
    $year=date("Y", strtotime($end));
    
    $start=($year-1)."-12-23";
    $end=$year."-12-22";
    $tasksAmount=DB::select('SELECT vacacc.*,vacacc.user_id uid,categories.name as category,ifnull(vaccons.vac_cons_m,0) as vac_cons_m,ifnull(vacacc.amount_m,0)-ifnull(vaccons.vac_cons_m,0) as rest FROM (Select users.name as fullname,users.job,users.category_id,vac_acc.* From (SELECT user_id,vacationstype_id as vid,SUM(`amount`) as amount_m FROM vacations_users where vacations_users.created_at BETWEEN ? and ? GROUP BY vacations_users.user_id,vacations_users.vacationstype_id) vac_acc right JOIN users on vac_acc.user_id=users.user_id) vacacc LEFT JOIN (SELECT user_id,type as vac_id,sum(time_to_sec(timediff(`attendancelogs`.`leave_time`,`attendancelogs`.`attendance_time`))/60) as vac_cons_m FROM attendancelogs WHERE date BETWEEN ? and ? and type>0 GROUP BY attendancelogs.user_id,attendancelogs.type) vaccons on vaccons.user_id=vacacc.user_id and vaccons.vac_id=vacacc.vid JOIN categories on vacacc.category_id=categories.id WHERE vacacc.user_id=?',[$start,$end,$start,$end,$user_id]);

    return compact('vacs','tasksAmount');
});

Route::get('tasks-info/{user_id}/{start}/{end}',function($user_id,$start,$end){
    $vacs=DB::select('SELECT vacationstypes.id,ifnull(time_format(sec_to_time(sum(time_to_sec(workHour))),"%H:%i"),0) as cumHours from calattendancelogs right join vacationstypes on type=vacationstypes.id  and  user_id=? and date BETWEEN ? and ? GROUP BY type,user_id', [$user_id,$start,$end]);
    $vacstypes=DB::select('select * from vacationstypes where att_report = 1 order by days desc');
    $totalConsumedVacs=DB::select("select user_id ,vacationstypes.id as vac_id,sec_to_time(vac.vacation_duration) as vac_duration from (SELECT user_id,type,sum(time_to_sec(timediff(leave_time,attendance_time))) as vacation_duration FROM `attendancelogs` where user_id=? and type>0 and attendance_time BETWEEN (SELECT value from settings where settings.key='admin.year_start' limit 1) and (SELECT value from settings where settings.key='admin.year_end' limit 1) GROUP BY user_id,type) vac join vacationstypes on vacationstypes.id=vac.type", [$user_id]);
   
    $year=date("Y", strtotime($end));
    
    $start=($year-1)."-12-23";
    $end=$year."-12-22";
    
    $tasksAmount=DB::select('SELECT vacacc.*,vacacc.user_id uid,categories.name as category,ifnull(vaccons.vac_cons_m,0) as vac_cons_m,ifnull(vacacc.amount_m,0)-ifnull(vaccons.vac_cons_m,0) as rest FROM (Select users.name as fullname,users.job,users.category_id,vac_acc.* From (SELECT user_id,vacationstype_id as vid,SUM(`amount`) as amount_m FROM vacations_users where vacations_users.created_at BETWEEN ? and ? GROUP BY vacations_users.user_id,vacations_users.vacationstype_id) vac_acc right JOIN users on vac_acc.user_id=users.user_id) vacacc LEFT JOIN (SELECT user_id,type as vac_id,sum(time_to_sec(timediff(`attendancelogs`.`leave_time`,`attendancelogs`.`attendance_time`))/60) as vac_cons_m FROM attendancelogs WHERE date BETWEEN ? and ? and type>0 GROUP BY attendancelogs.user_id,attendancelogs.type) vaccons on vaccons.user_id=vacacc.user_id and vaccons.vac_id=vacacc.vid JOIN categories on vacacc.category_id=categories.id WHERE vacacc.user_id=?',[$start,$end,$start,$end,$user_id]);
    
    $annuPerc=DB::select('SELECT uid,vid,round(time_to_sec(vac_duration)/(amount*60)*100) as perc FROM (SELECT `vacationstype_id`,SUM(`amount`) as amount,user_id FROM `vacations_users` GROUP BY user_id, `vacationstype_id`) vs JOIN cumvacations on cumvacations.uid=vs.user_id and cumvacations.vid=vs.vacationstype_id and vid=2 AND uid=?',[$user_id]);
    $requiredTasks=DB::select('Select vacationstypes.id as vac_id,ifnull(duration,0) as duration from (SELECT `vacationtype_id`,sec_to_time(SUM(if(datediff(date_to,date_from)>0,round(time_to_sec(getDuration(?,?)))*(datediff(date_to,date_from)+1),time_to_sec(timediff(date_to,date_from))))) as duration FROM `vacations` WHERE user_id=? and date_from BETWEEN ? and ? and `hr_manager` is NULL and vacationtype_id is not NULL GROUP BY vacations.vacationtype_id,user_id) vac right join vacationstypes on vac.vacationtype_id=vacationstypes.id',[$start,$user_id,$user_id,$start,$end]);
    return compact('vacs','vacstypes','totalConsumedVacs','tasksAmount','annuPerc','requiredTasks');
});
Route::get('/alerts-count/{user_id}',function($user_id){
    $alertsCount=DB::select('SELECT count(*) as count FROM alerts where status=0 and ( user_id=? or alerts.all=1) ', [$user_id]);
    return $alertsCount;
});
Route::get('/unread-alerts/{user_id}',function($user_id){
    $count=DB::select('SELECT count(*) as count FROM alerts where status=0 and ( user_id=? or alerts.all=1) ', [$user_id]);
    $alerts=DB::select('SELECT id,alerts.link,alerts.text FROM alerts where status=0 and ( user_id=? or alerts.all=1) order by created_at limit 5', [$user_id]);
    return compact('alerts','count');
});

Route::post('/read-alerts',function(Request $request){
    
    foreach($request->all() as $alert) {
        $alert=DB::table('alerts')->where('id',$alert['id'])->update(['status' => 1]);
    }

    return $request->all();
    
});

Route::get('/alerts/{user_id}/{start}/{end}',function($user_id,$start,$end){
    $alerts=DB::select('SELECT * FROM alerts where ( user_id=? or alerts.all=1) and created_at between ? and ? order by created_at desc', [$user_id,$start,$end]);
    return $alerts;
});
Route::get('/get-tasks/{id}/{start}/{end}','VacationAPIController@getTasks');
Route::get('/get-all-tasks/','VacationAPIController@getAllTasks');
Route::get('/get-tasks-requests/{id}/{start}/{end}','VacationAPIController@getTasksRequests');

Route::get('/get-all-accepted-tasks/{start}/{end}','VacationAPIController@getAllAcceptedTasks');
Route::get('/get-cum-tasks/{start}/{end}','VacationAPIController@getCumTasks');
Route::get('/user-type/{user_id}','VacationAPIController@whatType');
Route::get('/connected-devices',function(){
    $devices=Device::where('status',1)->get();
    return $devices;
});
Route::get('/events/{start}/{end}',function($start,$end){
    $events=DB::select('SELECT users.name as fullname ,events.user_id,events_datetime FROM events join users on events.user_id=users.user_id where events_datetime BETWEEN ? and ? order by events_datetime desc', [$start,$end]);
    return $events;
});
Route::get('/users/{today}/{start}/{end}',function($today,$start,$end){
    $users=DB::select('Select * from (SELECT attendancelogs.user_id as uid,MAX(attendancelogs.leave_time) as last_occ FROM attendancelogs  where type=0  GROUP BY user_id) log right join (SELECT users.*,categories.name as category,at.leave_time,at.attendance_time from users left join categories on users.category_id=categories.id left join (select user_id,min(attendancelogs.attendance_time) as attendance_time, CASE WHEN MAX(CASE WHEN attendancelogs.leave_time IS NULL THEN 1 ELSE 0 END) = 0 THEN MAX(attendancelogs.leave_time) END as leave_time from attendancelogs where date=? and type=0 group by user_id,date) as at on at.user_id=users.user_id where users.user_id is not null) as att on log.uid =att.user_id ORDER By att.name',[$today]);
    $phones=Phone::all();
    $allownces=Allownce::all();
    $qualifications=Qualification::all();
    $preworks=Prework::all();
    $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
   $lists=DB::select("Select users.user_id,users.name,users.job,categories.name as category,users.salary, r.lateTimePrice ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users  join categories on users.category_id=categories.id join (SELECT floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)*getMinutePrice(user_id,date))) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
        ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id order by category",[$start,$end,$start,$end,$start,$end,$start,$end]);
    $attachments=Attachment::all();
    return compact('users','phones','allownces','qualifications','preworks','attachments','lists','count');
});
Route::get('/user-data/{id}',function($id){
    $user=User::Find($id);
    $phones=Phone::all();
    $qualifications=Qualification::all();
    $preworks=Prework::all();
    $attachments=Attachment::all();
    return compact('user','phones','qualifications','preworks','attachments');
});
Route::get('/users-info',function(){
    $categroies=Category::select('id as value','name as label')->get();
    $durations=Durationtype::select('id as value','name as label')->get();
    $types=Type::select('id as value','name as label','parent_id as parent')->get();
    return compact('categroies','durations','types');
});
Route::get('/categories-cards/{today}/{start}/{end}',function($today,$start,$end){
    
      $categories=DB::select('SELECT categories.id,categories.order,categories.parent_id,categories.user_id,tot.tot_users,tof.tof_users,att.att_users,round((att.att_users/tot.tot_users)*100,0) as att_percent,categories.name,users.user_name FROM `categories` left join users on categories.user_id=users.user_id and categories.parent_id is null left join (SELECT count(*) as tot_users,category_id from users where users.status in ("16","17") and users.fingerprint_type="22" group by category_id ) as tot on tot.category_id=categories.id left join (SELECT count(*) as tof_users,category_id from users where users.status in ("16","17") and users.fingerprint_type<>"22" group by category_id ) as tof on tof.category_id=categories.id left join (SELECT count(*) as att_users,categories.id,categories.name from calattendancerecords join users on calattendancerecords.user_id=users.user_id and calattendancerecords.date=? left join categories on categories.id=users.category_id GROUP By category_id ) as att on att.id=categories.id order by att_percent desc,tot_users desc',[$today]);
      
      $count=DB::select("select count(date) as count from dates where type is NUll and date between ? and ?", [$start,$end]);
   
    $lists=DB::select("Select users.user_id,users.name,users.job,users.category_id,categories.name as category,users.salary, r.lateTimePrice ,r.attendanceDays ,users.symbiosis,d.amount as debt,a.amount as long_debt,v.vdiscount from users join categories on users.category_id=categories.id join (SELECT floor(sum((time_to_sec(Time_Format(lateTime,'%H:%i'))/60)*getMinutePrice(user_id,date))) as lateTimePrice,user_id,count(date) as attendanceDays from calattendancerecords where date BETWEEN ? and ? GROUP BY user_id) r on users.user_id=r.user_id left join (SELECT user_id,sum(amount) as amount from debts where debt_date between ? and ? group by user_id
        ) d on d.user_id=users.user_id left join (SELECT user_id,sum(if(owner=1,amount,0)) as amount from accounts where debt_date between ? and ? group by user_id) a on a.user_id=users.user_id left join (SELECT user_id,sum(money_discount) as vdiscount from violations where vio_date between ? and ? and status!='0' group by user_id) v on v.user_id=users.user_id order by category",[$start,$end,$start,$end,$start,$end,$start,$end]);
    
    return compact('categories','lists','count');
});

Route::get('/setting',function(){
    $settings=Setting::all();
    return $settings;
});

Route::post('/general-setting',function(Request $request){
  
  if($request->file('logo')){
   $path =$request->file('logo')->store('settings','public');
    
   $setting=DB::table('settings')->where('key', 'admin.logo')->update(['value' => $path]);
  }
  
   $setting=DB::table('settings')->where('key', 'admin.currency')->update(['value' => $request->input('currency')]);
   $setting=DB::table('settings')->where('key', 'admin.round')->update(['value' => $request->input('round')]);
   $setting=DB::table('settings')->where('key', 'admin.month_start')->update(['value' => $request->input('month_start')]);
   $setting=DB::table('settings')->where('key', 'admin.month_end')->update(['value' => $request->input('month_end')]);
   $setting=DB::table('settings')->where('key', 'admin.backend_link')->update(['value' => $request->input('backend_link')]);
   $setting=DB::table('settings')->where('key', 'admin.general_manager')->update(['value' => $request->input('general_manager')]);
  
   
   return "";
});

Route::get('/test',function(){
    
        $filename = "backup-" . Carbon::now()->format('Y-m-d') . ".gz";
        $command = "mysqldump --user=" . env('DB_USERNAME') ." --password=" . env('DB_PASSWORD') . " --host=" . env('DB_HOST') . " " . env('DB_DATABASE') . "  | gzip > " . storage_path() . "/app/backup/" . $filename;
        $returnVar = NULL;
        $output  = NULL;
        exec($command, $output, $returnVar);
        
        return $command;
});

